import { COMMENT_ID_PREFIX, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import { createHandler, errorResult, successResult } from './common';
import { DeleteCommentRequest } from '../../common/types/delete-comment-request';

import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const dynamo = getDynamoDb();

export const handler = createHandler<DeleteCommentRequest>({
    hasJsonBody: true,
    requiresAuth: true,
    handle: async (event, _request, authResult) => {
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
            ReturnValues: 'ALL_OLD', 
            ConditionExpression: 'userId = :u AND attribute_not_exists(deletedAt)'
        };

        try {
            const result = await dynamo.updateItem(deleteComment).promise();
            // If it's a reply, update the parent to reflect the new reply count
            if (result.Attributes?.threadId?.S) {
                const decrementParentReplyCount: UpdateItemInput = {
                    TableName: process.env.TABLE_NAME,
                    Key: {
                        PK: { S: PAGE_ID_PREFIX + url },
                        SK: { S: result.Attributes.threadId.S }
                    },
                    UpdateExpression: 'ADD numReplies :minusOne',
                    ExpressionAttributeValues: {':minusOne': {N: '-1'}}
                };
                await dynamo.updateItem(decrementParentReplyCount).promise();
            }
            return successResult({success: true});
        }
        catch (err) {
            if (err.code === 'ConditionalCheckFailedException') {
                return errorResult(403, 'Not authorized to delete');
            }
            else {
                return errorResult(500, 'Server error');
            }
        }
    }
});