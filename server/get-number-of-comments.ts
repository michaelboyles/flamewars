import { ApiGatewayRequest, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { createHandler, errorResult, successResult } from './common';
import { GetCommentCountResponse, CommentCount } from '../common/types/comment-count';
import { MAX_URLS_IN_COUNT_REQUEST } from '../constants';

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

export const handler = createHandler({
    hasJsonBody: false,
    requiresAuth: false,
    handle: async event => {
        const uniqueUrls = getUniqueUrls(event);
        if (uniqueUrls.length > MAX_URLS_IN_COUNT_REQUEST) {
            return errorResult(400, `Max URLs per request is ${MAX_URLS_IN_COUNT_REQUEST}, got ${uniqueUrls.length}`);
        }
    
        const results = await Promise.all(uniqueUrls.map(queryForUrl));
        const body: GetCommentCountResponse = {
            counts: results 
        };
        return successResult(body);
    }
});
