import { COMMENT_ID_PREFIX, getDynamoDb, getOverlongFields, PAGE_ID_PREFIX } from './aws';
import { createHandler, errorResult, successResult } from './common';
import { EditCommentRequest } from '../common/types/edit-comment-request';
import { MAX_COMMENT_LENGTH } from '../config';

import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const dynamo = getDynamoDb();

export const handler = createHandler<EditCommentRequest>({
    hasJsonBody: true,
    requiresAuth: true,
    handle: (event, request, authResult) => {
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
            return errorResult(400, 'Field(s) are too long: ' + overlongFields.join(', '));
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
        return new Promise(resolve => {
            dynamo.updateItem(updateComment, (err, _data) => {
                if (err) {
                    if (err.code === 'ConditionalCheckFailedException') {
                        return errorResult(403, 'Not authorized to edit');
                    }
                    else {
                        return errorResult(500, 'Server error');
                    }
                }
                else {
                    resolve(successResult({success: true}));
                }
            })
        });
    }
});