import type { ApiGatewayRequest, ApiGatewayResponse } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import type { GetAllCommentsResponse, Comment } from '../dist/get-all-comments-response'
import { ItemList, ScanOutput } from 'aws-sdk/clients/dynamodb';
import type { QueryInput } from 'aws-sdk/clients/dynamodb';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const responseHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Methods': 'POST'
};

function convertDataToResponse(data: ScanOutput) : GetAllCommentsResponse {
    return {
        comments: sortToHeirarchy(data.Items, '')
    };
}

function sortToHeirarchy(items: ItemList, parentId: string) : Comment[] {
    const comments: Comment[] = [];
    items.forEach(item => {
        if (item.parent.S === parentId) {
            comments.push({
                id: item.SK.S,
                author: {
                    name: 'Michael' //TODO not hardcoded
                },
                text: item.comment.S,
                timestamp: item.timestamp.S,
                replies: sortToHeirarchy(items, item.SK.S)
            });
        }
    });
    return comments;
}

export const handler: Handler = function(event: ApiGatewayRequest, context) {
    const url = event.queryStringParameters.url;
    const params: QueryInput = {
        TableName: 'FLAMEWARS',
        KeyConditionExpression: "PK = :u", 
        ExpressionAttributeValues: {
            ':u': { S: 'PAGE#' + url }
        }, 
        Select: 'ALL_ATTRIBUTES'
    };

    return new Promise((resolve, reject) => {
        dynamo.query(params, (err, data) => {
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
                    body: JSON.stringify(convertDataToResponse(data))
                };
                resolve(response);
            }
        })
    });
}
