import { handler } from '../get-comments';
import { COMMENT_ID_PREFIX, PAGE_ID_PREFIX } from '../aws';

import type { ApiGatewayRequest, DynamoComment } from '../aws';
import type { Context } from 'aws-lambda';
import type { QueryOutput } from 'aws-sdk/clients/dynamodb';
import type { GetAllCommentsResponse } from '../../common/types/get-all-comments-response';

jest.mock('../aws');
const aws = jest.requireMock('../aws');

const defaultRequest: ApiGatewayRequest = {
    body: '',
    queryStringParameters: {},
    pathParameters: { url: 'example.com/test' },
    requestContext: {
        domainName: '',
        path: ''
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
    userId:      {S: 'michael1234'}
};

const mockQueryResponse = (queryOutput: QueryOutput) => {
    aws.getDynamoDb = jest.fn().mockReturnValue({
        query: jest.fn().mockImplementation((_params, callback) => {
            const error = null;
            callback(error, queryOutput);
        })
    });
};

test('Success response', async () => {
    mockQueryResponse({ Items: [defaultComment] });

    const response = await handler(defaultRequest, {} as Context, () => {});

    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'michael1234', name: 'Michael'},
            text: 'My comment',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'normal',
            replies: [],
            votes: {
                upvoters: [],
                downvoters: []
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

test('Deleted comment is not shown', async () => {
    const comment: DynamoComment = {
        ...defaultComment,
        deletedAt: {S: '2021-02-02T00:00:00.000Z'}
    };
    mockQueryResponse({ Items: [comment] });

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
    mockQueryResponse({ Items: [comment] });

    const response = await handler(defaultRequest, {} as Context, () => {});
    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'michael1234', name: 'Michael'},
            text: 'My comment',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'edited',
            replies: [],
            votes: {
                upvoters: [],
                downvoters: []
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
        deletedAt: {S: '2021-02-02T00:00:00.000Z'}
    };
    const replyToDeleted: DynamoComment = {
        ...defaultComment,
        SK: {S: COMMENT_ID_PREFIX + 'xyz789'},
        threadId: {S: defaultComment.SK.S},
        parentId: {S: defaultComment.SK.S}
    };

    mockQueryResponse({ Items: [deletedComment, replyToDeleted] });

    const response = await handler(defaultRequest, {} as Context, () => {});
    const expectedResponseBody: GetAllCommentsResponse = {
        comments: [{
            id: 'abc123',
            author: {id: 'ANONYMOUS', name: 'Anonymous'},
            text: '',
            timestamp: '2021-01-01T00:00:00.000Z',
            status: 'deleted',
            replies: [{
                id: 'xyz789',
                author: {id: 'michael1234', name: 'Michael'},
                text: 'My comment',
                timestamp: '2021-01-01T00:00:00.000Z',
                status: 'normal',
                replies: [],
                votes: {
                    upvoters: [],
                    downvoters: []
                },
                inReplyTo: {
                    id: 'abc123'
                }
            }],
            votes: {
                upvoters: [],
                downvoters: []
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

test('Reply to non-existent comment is not shown', async () => {
    const deletedComment: DynamoComment = {
        ...defaultComment,
        threadId: {S: 'doesnt-exist'},
        parentId: {S: 'doesnt-exist'}
    };

    mockQueryResponse({ Items: [deletedComment] });

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
