import type { AddCommentRequest } from '../common/types/add-comment-request'
import type { AddCommentResponse } from '../common/types/add-comment-response'
import { ApiGatewayRequest, COMMENT_ID_PREFIX, DynamoComment, getDynamoDb, getOverlongFields, PAGE_ID_PREFIX } from './aws'
import type { Handler } from 'aws-lambda'
import { PutItemInput } from 'aws-sdk/clients/dynamodb'
import { AuthenticationResult, checkAuthentication } from './user-details'
import { MAX_COMMENT_LENGTH } from '../config'
import { v4 as uuid } from 'uuid';
import { getErrorResponse, getSuccessResponse } from './common';
import { normalizeUrl } from '../common/util'

const dynamo = getDynamoDb();

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    const request: AddCommentRequest = JSON.parse(event.body);

    const authResult: AuthenticationResult = await checkAuthentication(request.authorization);
    if (!authResult.isValid) {
        return getErrorResponse(403, 'Invalid authentication token');
    }

    const commentId = uuid();
    const timestamp = new Date().toISOString();
    const parent = request.inReplyTo ? (COMMENT_ID_PREFIX + request.inReplyTo) : '';
    const url = normalizeUrl(decodeURIComponent(event.pathParameters.url));

    const dynamoComment: DynamoComment = {
        PK       : { S: PAGE_ID_PREFIX + url },
        SK       : { S: COMMENT_ID_PREFIX + commentId },
        pageUrl  : { S: url },
        commentText: { S: request.comment },
        parent   : { S: parent },
        timestamp: { S: timestamp },
        author   : { S: authResult.userDetails.name },
        userId   : { S: authResult.userDetails.userId }
    };
    const overlongFields = getOverlongFields(dynamoComment, ['commentText']);
    if (request.comment.length > MAX_COMMENT_LENGTH) {
        overlongFields.push('commentText');
    }
    if (overlongFields.length) {
        return getErrorResponse(400, 'Field(s) are too long: ' + overlongFields.join(', '));
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
                    isEdited: false,
                    replies: []
                }
            };
            const lastSlash = event.requestContext.path.lastIndexOf('/');
            const location = 'https://'
                + event.requestContext.domainName
                + event.requestContext.path.substr(0, lastSlash + 1) // remove client's generated ID
                + commentId;

            return getSuccessResponse(201, body, {location});
        });
}
