import type { PostCommentRequest } from '../dist/post-comment-request'
import type { PostCommentResponse } from '../dist/post-comment-response'
import type { ApiGatewayRequest, ApiGatewayResponse, DynamoComment } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import { PutItemInput } from 'aws-sdk/clients/dynamodb';
import { getGoogleDetails } from './user-details';
import type { UserDetails } from './user-details';
import { MAX_COMMENT_LENGTH } from '../config'
import { v4 as uuid } from 'uuid';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const responseHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Methods': 'POST'
};

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    const request : PostCommentRequest = JSON.parse(event.body);

    if (!isValid(request)) {
        return {
            statusCode: 400,
            headers: responseHeaders,
            body: JSON.stringify({"success": false})
        } as ApiGatewayResponse;
    }

    let userDetails: UserDetails;
    switch (request.authorization.tokenProvider) {
        case 'Google':
            userDetails = await getGoogleDetails(request.authorization.token);
            break;
    }

    const commentId = '#COMMENT#' + uuid();
    const timestamp = new Date().toISOString();
    const parent = request.inReplyTo ? request.inReplyTo : '';

    const dynamoComment: DynamoComment = {
        PK       : { S: 'PAGE#' + request.url },
        SK       : { S: commentId },
        pageUrl  : { S: request.url },
        comment  : { S: request.comment },
        parent   : { S: parent },
        timestamp: { S: timestamp },
        author   : { S: userDetails.name },
        userId   : { S: userDetails.userId },
        isDeleted: { BOOL: false }
    };
    const params: PutItemInput = {
        TableName: 'FLAMEWARS',
        Item: dynamoComment
    };

    return dynamo.putItem(params)
        .promise()
        .then(() => {
            const body: PostCommentResponse = {
                success: true,
                comment: {
                    id: commentId,
                    author: {
                        id: userDetails.userId,
                        name: userDetails.name
                    },
                    text: request.comment,
                    timestamp: timestamp,
                    replies: []
                }
            };
            return {
                statusCode: 200,
                headers: responseHeaders,
                body: JSON.stringify(body)
            } as ApiGatewayResponse;
        });
}

function isValid(request: PostCommentRequest){
    return request.url
        && request.comment && request.comment.length <= MAX_COMMENT_LENGTH
        && request.authorization;
}