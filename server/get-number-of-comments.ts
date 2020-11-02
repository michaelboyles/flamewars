import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';
import { GetCommentCountResponse, CommentCount } from '../dist/comment-count'

const dynamo = getDynamoDb();

function queryForUrl(url: string): Promise<CommentCount> {
    const params: QueryInput = {
        TableName: 'FLAMEWARS',
        KeyConditionExpression: "PK = :u", 
        ExpressionAttributeValues: {
            ':u': { S: 'PAGE#' + url },
            ':d': { BOOL: false }
        },
        FilterExpression: "isDeleted = :d",
        Select: 'COUNT'
    };

    return new Promise((resolve, _reject) => {
        dynamo.query(params, (err, data) => {
            if (err) {
                resolve({url: url, count: 0});
            }
            else {
                resolve({url: url, count: data.Count});
            }
        })
    });
}

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    const urls: string = event.queryStringParameters.urls;
    const uniqueUrls = Array.from(new Set(urls.split(',')));
    const results = await Promise.all(uniqueUrls.map(queryForUrl));

    const body: GetCommentCountResponse = {
        success: true,
        counts: results 
    };

    const response: ApiGatewayResponse = {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
    return response;
}
