import { handler } from '../get-comments';
import { COMMENT_ID_PREFIX, PAGE_ID_PREFIX } from '../aws';

import type { ApiGatewayRequest, DynamoComment } from '../aws';
import type { Context } from 'aws-lambda';
import type { GetAllCommentsResponse } from '../../../common/types/get-all-comments-response';
import type { LimitResult } from '../dynamo';

jest.mock('../dynamo');
const dynamo = jest.requireMock('../dynamo');

const defaultRequest: ApiGatewayRequest = {
    body: '',
    queryStringParameters: {},
    pathParameters: { url: 'example.com%2Ftest' },
    requestContext: {
        domainName: 'api.example.com',
        path: '/default/comments/example.com%2Ftest'
    },
    headers: {}
};

const defaultComment: DynamoComment = {
    PK:          {S: PAGE_ID_PREFIX + 'example.com/test'},
    SK:          {S: COMMENT_ID_PREFIX + 'abc123'},
    pageUrl:     {S: 'example.com/test'},
    commentText: {S: 'My comment'},
    timestamp:   {S: '2021-01-01T00:00:00.000Z'},
    author:      {S: 'Michael'},
    userId:      {S: 'michael1234'},
    numReplies:  {N: '0'}
};

const mockQueryResponse = (queryOutput: LimitResult) => {
    dynamo.limitQuery = jest.fn().mockReturnValue(Promise.resolve(queryOutput));
};

test('Success response', async () => {
    mockQueryResponse({ items: [defaultComment] });

    const response = await handler(defaultRequest, {} as Context, () => {});

    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'michael1234', name: 'Michael'},
            text: 'My comment',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'normal',
            votes: {
                upvoters: [],
                downvoters: []
            },
            replies: {
                count: 0
            },
        }]
    };
    expect(response).toStrictEqual({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: JSON.stringify(expectedResponseBody)
    });
});

test('No comments results in empty response', async () => {
    mockQueryResponse({ items: [] });

    const response = await handler(defaultRequest, {} as Context, () => {});
    const expectedResponseBody: GetAllCommentsResponse = {
        comments: []
    }; 
    expect(response).toStrictEqual({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: JSON.stringify(expectedResponseBody)
    });
});

test('Edited comment has flag', async () => {
    const comment: DynamoComment = {
        ...defaultComment,
        editedAt: {S: '2021-02-02T00:00:00.000Z'}
    };
    mockQueryResponse({ items: [comment] });

    const response = await handler(defaultRequest, {} as Context, () => {});
    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'michael1234', name: 'Michael'},
            text: 'My comment',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'edited',
            votes: {
                upvoters: [],
                downvoters: []
            },
            replies: {
                count: 0
            }
        }]
    };
    expect(response).toStrictEqual({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: JSON.stringify(expectedResponseBody)
    });
});

test('Deleted comment is shown if it has a reply', async () => {
    const deletedComment: DynamoComment = {
        ...defaultComment,
        deletedAt: {S: '2021-02-02T00:00:00.000Z'},
        numReplies: {N: '1'}
    };

    mockQueryResponse({ items: [deletedComment] });

    const response = await handler(defaultRequest, {} as Context, () => {});
    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'ANONYMOUS', name: 'Anonymous'},
            text: '',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'deleted',
            votes: {
                upvoters: [],
                downvoters: []
            },
            replies: {
                uri: 'https://api.example.com/default/comments/example.com%2Ftest/abc123/replies',
                count: 1
            }
        }]
    };
    expect(response).toStrictEqual({
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
        },
        body: JSON.stringify(expectedResponseBody)
    });
});
