import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import type { Handler } from 'aws-lambda'
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { getErrorResponse, getSuccessResponse } from './common';
import { GetCommentCountResponse, CommentCount } from '../common/types/comment-count'

const MAX_URLS = 30;
const dynamo = getDynamoDb();

function getUniqueUrls(request: ApiGatewayRequest): string[] {
    const urls: string = request.queryStringParameters.urls;
    return Array.from(new Set(urls.split(',')));
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
    const uniqueUrls = getUniqueUrls(request);
    if (uniqueUrls.length > MAX_URLS) {
        return getErrorResponse(400, `Max URLs per request is ${MAX_URLS}, got ${uniqueUrls.length}`);
    }

    const results = await Promise.all(uniqueUrls.map(queryForUrl));
    const body: GetCommentCountResponse = {
        counts: results 
    };

    return getSuccessResponse(200, body);
}
