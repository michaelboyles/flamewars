import { COMMENT_ID_PREFIX, DynamoComment, DynamoString, getDynamoDb, getOverlongFields, getRequestUrl, PAGE_ID_PREFIX } from './aws';
import { PutItemInput, UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { MAX_COMMENT_LENGTH } from '../../common/constants';
import { v4 as uuid } from 'uuid';
import { createHandler, errorResult } from './common';
import { normalizeUrl } from '../../common/util';

import type { AddCommentRequest } from '../../common/types/add-comment-request';
import type { AddCommentResponse } from '../../common/types/add-comment-response';

const dynamo = getDynamoDb();

export const handler = createHandler<AddCommentRequest>({
    hasJsonBody: true,
    requiresAuth: true,
    handle: (event, request, authResult) => {
        const now = new Date();
        const timestamp = now.toISOString();
        const commentId = generateCommentId(now);
        const url = normalizeUrl(decodeURIComponent(event.pathParameters.url));

        const dynamoComment: DynamoComment = {
            PK       : { S: PAGE_ID_PREFIX + url },
            SK       : { S: COMMENT_ID_PREFIX + commentId },
            pageUrl  : { S: url },
            commentText: { S: request.comment },
            timestamp: { S: timestamp },
            author   : { S: authResult.userDetails.name },
            userId   : { S: authResult.userDetails.userId },
            numReplies: { N: '0' },
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

        const promises = [dynamo.putItem(params).promise()];
        if (request.inReplyTo) {
            const input: UpdateItemInput = {
                TableName: process.env.TABLE_NAME,
                Key: {
                    PK: { S: PAGE_ID_PREFIX + url },
                    SK: { S: COMMENT_ID_PREFIX + request.inReplyTo.threadId }
                },
                UpdateExpression: 'ADD numReplies :inc',
                ExpressionAttributeValues: {':inc': {N: '1'}},
            };

            promises.push(dynamo.updateItem(input).promise());
        }
        
        return Promise.all(promises)
            .then(() => {
                const requestUrl = getRequestUrl(event);
                const lastSlash = requestUrl.lastIndexOf('/'); // remove client's generated ID
                const location = requestUrl.substr(0, lastSlash + 1) + commentId;

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
                        replies: {
                            uri: location + '/replies',
                            count: 0
                        },
                        votes: { upvoters: [], downvoters: [] }
                    }
                };
                return {
                    statusCode: 201,
                    body,
                    extraHeaders: {location}
                };
            });
    }
});

function generateCommentId(time: Date) {
    // Use timestamp in millis so that comments are sortable by ID. It's needed by Dynamo to ensure ordering
    // when querying. UUID is used as a tie-breaker in case two comments land on the same millisecond. Just
    // take the first part so it's easier to work with.
    const id = uuid();
    const shortId = id.substr(0, id.indexOf('-'));
    return time.getTime() + '-' + shortId;
}

function getReplyFields(request: AddCommentRequest): Record<string, DynamoString> {
    if (request.inReplyTo) {
        return {
            threadId: {S: COMMENT_ID_PREFIX + request.inReplyTo.threadId},
            parentId: {S: COMMENT_ID_PREFIX + request.inReplyTo.commentId}
        };
    }
    return {};
}
