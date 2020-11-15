import { ApiGatewayRequest, ApiGatewayResponse, COMMENT_ID_PREFIX, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';
import { EditCommentRequest } from '../common/types/edit-comment-request'
import { AuthenticationResult, checkAuthentication } from './user-details';

const dynamo = getDynamoDb();

function getErrorResponse(statusCode: number, message: string): ApiGatewayResponse {
    return {
        statusCode: statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify({success: false, error: message}) //TODO define schema
    };
}

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    let request: EditCommentRequest;
    try {
        request = JSON.parse(event.body);
    } 
    catch(err) {
        return Promise.resolve(getErrorResponse(400, 'Invalid JSON body'));
    }

    const authResult: AuthenticationResult = await checkAuthentication(request.authorization);
    if (!authResult.isValid) {
        return Promise.resolve(getErrorResponse(403, 'Invalid authentication token'));
    }

    const url = decodeURIComponent(event.pathParameters.url);
    const commentId = event.pathParameters.comment;
    const updateComment: UpdateItemInput = {
        TableName: 'FLAMEWARS',
        Key: {
            PK: { S: 'PAGE#' + url },
            SK: { S: COMMENT_ID_PREFIX + commentId }
        },
        UpdateExpression: 'SET isEdited = :e, commentText = :c',
        ExpressionAttributeValues: {
            ':e': { BOOL: true },
            ':c': { S: request.comment },
            ':u': { S: authResult.userDetails.userId }
        },
        ConditionExpression: 'userId = :u'
    };
    return new Promise((resolve, reject) => {
        dynamo.updateItem(updateComment, (err, _data) => {
            if (err) {
                reject(err);
            }
            else {
                const response: ApiGatewayResponse = {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({success: true})
                };
                resolve(response);
            }
        })
    })
    .catch(err => {
        if (err.code === 'ConditionalCheckFailedException') {
            return getErrorResponse(403, 'Not authorized to edit');
        }
        else {
            return getErrorResponse(500, 'Server error');
        }
    });
}
