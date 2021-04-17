import { ApiGatewayRequest, COMMENT_ID_PREFIX, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { getErrorResponse, getSuccessResponse } from './common';
import { DeleteCommentRequest } from '../common/types/delete-comment-request'
import { AuthenticationResult, checkAuthentication } from './user-details';

const dynamo = getDynamoDb();

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    let request: DeleteCommentRequest;
    try {
        request = JSON.parse(event.body);
    } 
    catch(err) {
        return getErrorResponse(400, 'Invalid JSON body');
    }

    const authResult: AuthenticationResult = await checkAuthentication(request.authorization);
    if (!authResult.isValid) {
        return getErrorResponse(403, 'Invalid authentication token');
    }

    const url = decodeURIComponent(event.pathParameters.url);
    const commentId = event.pathParameters.comment;
    const deleteComment: UpdateItemInput = {
        TableName: process.env.TABLE_NAME,
        Key: {
            PK: { S: PAGE_ID_PREFIX + url },
            SK: { S: COMMENT_ID_PREFIX + commentId }
        },
        UpdateExpression: 'SET deletedAt = :ts',
        ExpressionAttributeValues: {
            ':ts': { S: new Date().toISOString() },
            ':u': { S: authResult.userDetails.userId }
        },
        ConditionExpression: 'userId = :u AND attribute_not_exists(deletedAt)'
    };
    return new Promise((resolve, reject) => {
        dynamo.updateItem(deleteComment, (err, _data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(getSuccessResponse(200, {success: true}));
            }
        })
    })
    .catch(err => {
        if (err.code === 'ConditionalCheckFailedException') {
            return getErrorResponse(403, 'Not authorized to delete');
        }
        else {
            return getErrorResponse(500, 'Server error');
        }
    });
}
