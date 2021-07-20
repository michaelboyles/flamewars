import { ApiGatewayRequest, continuationTokenToStr, getRequestUrl, parseContinuationToken } from '../aws';

const defaultApiGateRequest: ApiGatewayRequest = {
    body: '',
    pathParameters: {},
    requestContext: {
        domainName: 'mydomain',
        path: '/request/path'
    },
    headers: {},
    queryStringParameters: {}
};

test('Get continuation token from query output', () => {
    const queryOutput = {
        LastEvaluatedKey: {
            PK: {S: 'my-primary-key'},
            SK: {S: 'my-secondary-key'}
        }
    };
    const token = continuationTokenToStr(queryOutput.LastEvaluatedKey);
    expect(token).toEqual('eyJQSyI6eyJTIjoibXktcHJpbWFyeS1rZXkifSwiU0siOnsiUyI6Im15LXNlY29uZGFyeS1rZXkifX0=');
});

test('Get key from encoded continuation token in API request', () => {
    const request: ApiGatewayRequest = {
        ...defaultApiGateRequest,
        
        queryStringParameters: {
            continuationToken: 'eyJQSyI6eyJTIjoibXktcHJpbWFyeS1rZXkifSwiU0siOnsiUyI6Im15LXNlY29uZGFyeS1rZXkifX0='
        }
    };

    const key = parseContinuationToken(request);
    expect(key).toStrictEqual({
        PK: {S: 'my-primary-key'},
        SK: {S: 'my-secondary-key'}
    });
});

test('Get absolute URL from API request', () => {
    const url = getRequestUrl(defaultApiGateRequest);
    expect(url).toEqual('https://mydomain/request/path');
});
