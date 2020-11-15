import { ApiGatewayRequest, ApiGatewayResponse, DynamoComment, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import type { GetAllCommentsResponse, Comment } from '../dist/get-all-comments-response'
import { ItemList, QueryOutput } from 'aws-sdk/clients/dynamodb';
import type { QueryInput } from 'aws-sdk/clients/dynamodb';
import { DELETED_MESSAGE } from '../config';
import { CORS_HEADERS } from './common';

const dynamo = getDynamoDb();

function convertDataToResponse(data: QueryOutput) : GetAllCommentsResponse {
    return {
        comments: sortToHeirarchy(data.Items, '')
    };
}

function sortToHeirarchy(items: ItemList, parentId: string) : Comment[] {
    const comments: Comment[] = [];
    items.forEach((item: DynamoComment) => {
        if (item.parent.S === parentId) {
            const children = sortToHeirarchy(items, item.SK.S);
            if (item.isDeleted.BOOL && !children.length) {
                return;
            }
            comments.push({
                id: item.SK.S,
                author: {
                    id: item.isDeleted.BOOL ? 'ANONYMOUS' : item.userId.S,
                    name: item.isDeleted.BOOL ? 'Anonymous' : item.author.S
                },
                text: item.isDeleted.BOOL ? DELETED_MESSAGE : item.comment.S,
                timestamp: item.timestamp.S,
                replies: children
            });
        }
    });
    return comments;
}

export const handler: Handler = function(event: ApiGatewayRequest, _context) {
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
                    headers: CORS_HEADERS,
                    body: JSON.stringify(event)
                };
                reject(response);
            }
            else {
                const response: ApiGatewayResponse = {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify(convertDataToResponse(data))
                };
                resolve(response);
            }
        })
    });
}
