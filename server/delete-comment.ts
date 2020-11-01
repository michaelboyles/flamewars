import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';

const dynamo = getDynamoDb();

export const handler: Handler = function(event: ApiGatewayRequest, _context) {
    const url = event.queryStringParameters.url;
    const commentId = event.queryStringParameters.commentId;

    //TODO check if they are really the owner first
    const deleteComment: UpdateItemInput = {
        TableName: 'FLAMEWARS',
        Key: {
            PK: { S: 'PAGE#' + url },
            SK: { S: commentId }
        },
        UpdateExpression: 'SET isDeleted = :d',
        ExpressionAttributeValues: {
            ':d': { BOOL: true }
        }
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
