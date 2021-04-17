import { COMMENT_ID_PREFIX, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import { createHandler, errorResult, successResult } from './common';
import { DeleteCommentRequest } from '../common/types/delete-comment-request';

import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const dynamo = getDynamoDb();

export const handler = createHandler<DeleteCommentRequest>({
    hasJsonBody: true,
    requiresAuth: true,
    handle: (event, _request, authResult) => {
        const url = decodeURIComponent(event.pathParameters.url);
        const commentId = event.pathParameters.comment;
        const deleteComment: UpdateItemInput = {
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: { S: PAGE_ID_PREFIX + url },
                SK: { S: COMMENT_ID_PREFIX + commentId }
            },
            UpdateExpression: 'SET deletedAt = :ts',
            ExpressionAttributeValues: {
                ':ts': { S: new Date().toISOString() },
                ':u': { S: authResult.userDetails.userId }
            },
            ConditionExpression: 'userId = :u AND attribute_not_exists(deletedAt)'
        };
        return new Promise((resolve) => {
            dynamo.updateItem(deleteComment, (err, _data) => {
                if (err) {
                    if (err.code === 'ConditionalCheckFailedException') {
                        return resolve(errorResult(403, 'Not authorized to delete'));
                    }
                    else {
                        return resolve(errorResult(500, 'Server error'));
                    }
                }
                else {
                    resolve(successResult({success: true}));
                }
            })
        });
    }
});