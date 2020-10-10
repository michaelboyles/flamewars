import type { ApiGatewayRequest, ApiGatewayResponse } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import type { GetAllCommentsResponse, Comment } from '../dist/get-all-comments-response'
import { ScanOutput } from 'aws-sdk/clients/dynamodb';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

function convertDataToResponse(data: ScanOutput) {
    let comments: Comment[] = [];

    data.Items.forEach(item => comments.push({
        id: item.id.S,
        author: {
            name: 'Michael'
        },
        text: item.comment.S,
        timestamp: item.timestamp.S,
        replies: []
    }));

    const body: GetAllCommentsResponse = {comments: comments}
    return body;
}

export const handler: Handler = function(event: ApiGatewayRequest, context) {
    const url = event.queryStringParameters.url;
    const params = {
        TableName: 'COMMENTS',
        FilterExpression: "pageUrl = :u", 
        ExpressionAttributeValues: {
            ":u": { S: url }
        }, 
        Select: 'ALL_ATTRIBUTES'
    };

    return new Promise((resolve, reject) => {
        dynamo.scan(params, (err, data) => {
            if (err) {
                console.log(err, err.stack);
                const response: ApiGatewayResponse = {
                    statusCode: 500,
                    body: JSON.stringify(event)
                };
                reject(response);
            }
            else {
                const response: ApiGatewayResponse = {
                    statusCode: 200,
                    body: JSON.stringify(convertDataToResponse(data))
                };
                resolve(response);
            }
        })
    });
}
