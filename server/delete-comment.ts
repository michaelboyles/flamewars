import type { ApiGatewayRequest, ApiGatewayResponse } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import type { DeleteItemInput } from 'aws-sdk/clients/dynamodb';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const responseHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Methods': 'DELETE'
};

export const handler: Handler = function(event: ApiGatewayRequest, _context) {
    const url = event.queryStringParameters.url;
    const commentId = event.queryStringParameters.commentId;

    //TODO check if they are really the owner first
    const deleteComment: DeleteItemInput = {
        TableName: 'FLAMEWARS',
        Key: {
            PK: { S: 'PAGE#' + url },
            SK: { S: commentId }
        }
    };
    return new Promise((resolve, reject) => {
        dynamo.deleteItem(deleteComment, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                const response: ApiGatewayResponse = {
                    statusCode: 500,
                    headers: responseHeaders,
                    body: JSON.stringify(event)
                };
                reject(response);
            }
            else {
                const response: ApiGatewayResponse = {
                    statusCode: 200,
                    headers: responseHeaders,
                    body: JSON.stringify({success: true, abbc: 'abasbas', foo: data})
                };
                resolve(response);
            }
        })
    });
}
