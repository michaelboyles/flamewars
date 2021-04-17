import { ApiGatewayRequest, COMMENT_ID_PREFIX, getDynamoDb, getOverlongFields, PAGE_ID_PREFIX } from './aws';
import type { Handler } from 'aws-lambda'
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import { getErrorResponse, getSuccessResponse } from './common';
import { EditCommentRequest } from '../common/types/edit-comment-request'
import { AuthenticationResult, checkAuthentication } from './user-details';
import { MAX_COMMENT_LENGTH } from '../config';

const dynamo = getDynamoDb();

export const handler: Handler = async function(event: ApiGatewayRequest, _context) {
    let request: EditCommentRequest;
    try {
        request = JSON.parse(event.body);
    } 
    catch(err) {
        return getErrorResponse(400, 'Invalid JSON body');
    }

    const authResult: AuthenticationResult = await checkAuthentication(request.authorization);
    if (!authResult.isValid) {
        return getErrorResponse(403, 'Invalid authentication token');
    }

    const url = decodeURIComponent(event.pathParameters.url);
    const commentId = event.pathParameters.comment;

    const expressionAttrs = {
        ':ts': { S: new Date().toISOString() },
        ':c': { S: request.comment },
        ':u': { S: authResult.userDetails.userId }
    };
    const overlongFields = getOverlongFields(expressionAttrs, [':c']);
    if (request.comment.length > MAX_COMMENT_LENGTH) {
        overlongFields.push('commentText');
    }
    if (overlongFields.length) {
        return getErrorResponse(400, 'Field(s) are too long: ' + overlongFields.join(', '));
    }

    const updateComment: UpdateItemInput = {
        TableName: process.env.TABLE_NAME,
        Key: {
            PK: { S: PAGE_ID_PREFIX + url },
            SK: { S: COMMENT_ID_PREFIX + commentId }
        },
        UpdateExpression: 'SET editedAt = :ts, commentText = :c',
        ExpressionAttributeValues: expressionAttrs,
        ConditionExpression: 'userId = :u AND attribute_not_exists(deletedAt) AND commentText <> :c'
    };
    return new Promise((resolve, reject) => {
        dynamo.updateItem(updateComment, (err, _data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(getSuccessResponse(200, {success: true}));
            }
        })
    })
    .catch(err => {
        if (err.code === 'ConditionalCheckFailedException') {
            return getErrorResponse(403, 'Not authorized to edit');
        }
        else {
            return getErrorResponse(500, 'Server error');
        }
    });
}
