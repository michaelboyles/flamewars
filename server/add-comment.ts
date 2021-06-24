import { COMMENT_ID_PREFIX, DynamoComment, DynamoString, getDynamoDb, getOverlongFields, PAGE_ID_PREFIX } from './aws';
import { PutItemInput } from 'aws-sdk/clients/dynamodb';
import { MAX_COMMENT_LENGTH } from '../constants';
import { v4 as uuid } from 'uuid';
import { createHandler, errorResult } from './common';
import { normalizeUrl } from '../common/util';

import type { AddCommentRequest } from '../common/types/add-comment-request';
import type { AddCommentResponse } from '../common/types/add-comment-response';

const dynamo = getDynamoDb();

export const handler = createHandler<AddCommentRequest>({
    hasJsonBody: true,
    requiresAuth: true,
    handle: (event, request, authResult) => {
        const commentId = uuid();
        const timestamp = new Date().toISOString();
        const url = normalizeUrl(decodeURIComponent(event.pathParameters.url));

        const dynamoComment: DynamoComment = {
            PK       : { S: PAGE_ID_PREFIX + url },
            SK       : { S: COMMENT_ID_PREFIX + commentId },
            pageUrl  : { S: url },
            commentText: { S: request.comment },
            timestamp: { S: timestamp },
            author   : { S: authResult.userDetails.name },
            userId   : { S: authResult.userDetails.userId },
            ...getReplyFields(request)
        };
        const overlongFields = getOverlongFields(dynamoComment, ['commentText']);
        if (request.comment.length > MAX_COMMENT_LENGTH) {
            overlongFields.push('commentText');
        }
        if (overlongFields.length) {
            return errorResult(400, 'Field(s) are too long: ' + overlongFields.join(', '));
        }

        const params: PutItemInput = {
            TableName: process.env.TABLE_NAME,
            Item: dynamoComment
        };

        return dynamo.putItem(params)
            .promise()
            .then(() => {
                const body: AddCommentResponse = {
                    comment: {
                        id: commentId,
                        author: {
                            id: authResult.userDetails.userId,
                            name: authResult.userDetails.name
                        },
                        text: request.comment,
                        timestamp: timestamp,
                        status: 'normal',
                        replies: [],
                        votes: { upvoters: [], downvoters: [] }
                    }
                };
                const lastSlash = event.requestContext.path.lastIndexOf('/');
                const location = 'https://'
                    + event.requestContext.domainName
                    + event.requestContext.path.substr(0, lastSlash + 1) // remove client's generated ID
                    + commentId;

                return {
                    statusCode: 201,
                    body,
                    extraHeaders: {location}
                };
            });
    }
});

function getReplyFields(request: AddCommentRequest): Record<string, DynamoString> {
    if (request.inReplyTo) {
        return {
            threadId: {S: COMMENT_ID_PREFIX + request.inReplyTo.threadId},
            parentId: {S: COMMENT_ID_PREFIX + request.inReplyTo.commentId}
        };
    }
    return {};
}
