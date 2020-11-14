import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';
import { DeleteCommentRequest } from '../dist/delete-comment-request'
import { AuthenticationResult, getGoogleDetails } from './user-details';

const dynamo = getDynamoDb();

function checkAuthentication(request: DeleteCommentRequest): Promise<AuthenticationResult> {
    switch (request.authorization.tokenProvider) {
        case 'Google':
            return getGoogleDetails(request.authorization.token);
    }
}

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    const url = event.queryStringParameters.url;
    const commentId = event.queryStringParameters.commentId;
    const request: DeleteCommentRequest = JSON.parse(event.body);

    const authResult: AuthenticationResult = await checkAuthentication(request);
    if (!authResult.isValid) {
        const response: ApiGatewayResponse = {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({success: false, error: 'Not authorized'}) //TODO define schema
        };
        return Promise.resolve(response);
    }

    const deleteComment: UpdateItemInput = {
        TableName: 'FLAMEWARS',
        Key: {
            PK: { S: 'PAGE#' + url },
            SK: { S: commentId }
        },
        UpdateExpression: 'SET isDeleted = :d',
        ExpressionAttributeValues: {
            ':d': { BOOL: true },
            ':u': { S: authResult.userDetails.userId }
        },
        ConditionExpression: 'userId = :u'
    };
    return new Promise((resolve, reject) => {
        dynamo.updateItem(deleteComment, (err, _data) => {
            if (err) {
                const response: ApiGatewayResponse = {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({success: false})
                };
                reject(response);
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
    });
}
