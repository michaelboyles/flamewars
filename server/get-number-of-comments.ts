import type { ApiGatewayRequest, ApiGatewayResponse } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import { QueryInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

type UrlAndCount = {
    url: string;
    count: number;
}

function queryForUrl(url: string): Promise<UrlAndCount> {
    const params: QueryInput = {
        TableName: 'FLAMEWARS',
        KeyConditionExpression: "PK = :u", 
        ExpressionAttributeValues: {
            ':u': { S: 'PAGE#' + url }
        }, 
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

    const body = {}; //TODO add a schema
    results.forEach(result => body[result.url] = result.count);

    const response: ApiGatewayResponse = {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    }
    return response;
}
