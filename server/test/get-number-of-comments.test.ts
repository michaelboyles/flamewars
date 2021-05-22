import { handler } from '../get-number-of-comments';
import { Context } from 'aws-lambda';
import { MAX_URLS_IN_COUNT_REQUEST } from '../../constants';

import type { ApiGatewayRequest } from '../aws';

jest.mock('../aws');
const aws = jest.requireMock('../aws');

const defaultRequest: ApiGatewayRequest = {
    body: '',
    queryStringParameters: {},
    pathParameters: {},
    requestContext: {
        domainName: '',
        path: ''
    },
    headers: {}
};

test('Success response', async () => {
    const numComments = 99;

    aws.getDynamoDb = jest.fn().mockReturnValue({
        query: jest.fn().mockImplementation((_params, callback) => {
            const error = null;
            callback(error, { Count: numComments });
        })
    });

    const apiGatewayRequest: ApiGatewayRequest = {
        ...defaultRequest,
        queryStringParameters: { urls: 'example.com' }
    };

    const response = await handler(apiGatewayRequest, {} as Context, () => {});
    expect(response).toStrictEqual({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: `{"counts":[{"url":"example.com","count":${numComments}}]}`
    });
});

test(`Max URLs in a count request is ${MAX_URLS_IN_COUNT_REQUEST}`, async () => {
    const urls = Array.from(Array(MAX_URLS_IN_COUNT_REQUEST + 1).keys()).map(i => `example.com/${i}`).join(',');

    const apiGatewayRequest: ApiGatewayRequest = {
        ...defaultRequest,
        queryStringParameters: { urls }
    };

    const response = await handler(apiGatewayRequest, {} as Context, () => {});
    expect(response).toStrictEqual({
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: `{"error":"Max URLs per request is ${MAX_URLS_IN_COUNT_REQUEST}, got ${MAX_URLS_IN_COUNT_REQUEST + 1}"}`
    });
});
