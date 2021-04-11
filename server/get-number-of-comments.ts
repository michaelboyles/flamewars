import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import type { Handler } from 'aws-lambda'
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';
import { GetCommentCountResponse, CommentCount } from '../common/types/comment-count'

const MAX_URLS = 30;
const dynamo = getDynamoDb();

function isRequestValid(request: ApiGatewayRequest) {
    return getUniqueUrls(request).length <= MAX_URLS;
}

function getUniqueUrls(request: ApiGatewayRequest): string[] {
    const urls: string = request.queryStringParameters.urls;
    return Array.from(new Set(urls.split(',')));
}

function failResponse(): ApiGatewayResponse {
    const failBody: GetCommentCountResponse = {
        success: false,
        counts: [] 
    };
    const failResponse: ApiGatewayResponse = {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify(failBody)
    }
    return failResponse;
}

function queryForUrl(url: string): Promise<CommentCount> {
    const params: QueryInput = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'PK = :u', 
        ExpressionAttributeValues: {
            ':u': { S: PAGE_ID_PREFIX + url }
        },
        FilterExpression: 'attribute_not_exists(deletedAt)',
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

export const handler: Handler = async function(request: ApiGatewayRequest, _context): Promise<ApiGatewayResponse> {
    if (!isRequestValid(request)) return failResponse();

    const results = await Promise.all(getUniqueUrls(request).map(queryForUrl));
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
