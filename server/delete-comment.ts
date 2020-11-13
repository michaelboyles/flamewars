import { ApiGatewayRequest, ApiGatewayResponse, getDynamoDb } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { CORS_HEADERS } from './common';
import { DeleteCommentRequest } from '../dist/delete-comment-request'
import { getGoogleDetails, UserDetails } from './user-details';

const dynamo = getDynamoDb();

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    const url = event.queryStringParameters.url;
    const commentId = event.queryStringParameters.commentId;
    const request: DeleteCommentRequest = JSON.parse(event.body);

    let userDetails: UserDetails;
    switch (request.authorization.tokenProvider) {
        case 'Google':
            userDetails = await getGoogleDetails(request.authorization.token);
            break;
    }

    // TODO better error handling if you are not the owner, e.g. 403
    const deleteComment: UpdateItemInput = {
        TableName: 'FLAMEWARS',
        Key: {
            PK: { S: 'PAGE#' + url },
            SK: { S: commentId }
        },
        UpdateExpression: 'SET isDeleted = :d',
        ExpressionAttributeValues: {
            ':d': { BOOL: true },
            ':u': { S: userDetails.userId }
        },
        ConditionExpression: 'userId = :u'
    };
    return new Promise((resolve, reject) => {
        dynamo.updateItem(deleteComment, (err, _data) => {
            if (err) {
                const response: ApiGatewayResponse = {
                    statusCode: 500,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({success: false})
                };
                reject(response);
            }
            else {
                const response: ApiGatewayResponse = {
                    statusCode: 200,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({success: true})
                };
                resolve(response);
            }
        })
    });
}
