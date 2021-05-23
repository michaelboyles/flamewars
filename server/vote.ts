import { COMMENT_ID_PREFIX, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import { createHandler, errorResult, successResult } from './common';

import type { VoteRequest } from '../common/types/vote';
import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';

const getUpdateExpression = (request: VoteRequest) => {
    switch (request.voteType) {
        case 'up':
            return 'ADD upvoters :u DELETE downvoters :u';
        case 'down':
            return 'DELETE upvoters :u ADD downvoters :u';
        case 'none':
            return 'DELETE upvoters :u, downvoters :u';
    }
}

export const handler = createHandler({
    hasJsonBody: true,
    requiresAuth: true,
    handle: (event, request: VoteRequest, authResult) => {
        const url = decodeURIComponent(event.pathParameters.url);
        const commentId = event.pathParameters.comment;
        const expressionAttrs = {
            ':u': { SS: [authResult.userDetails.userId] }
        };

        const updateComment: UpdateItemInput = {
            TableName: process.env.TABLE_NAME,
            Key: {
                PK: { S: PAGE_ID_PREFIX + url },
                SK: { S: COMMENT_ID_PREFIX + commentId }
            },
            UpdateExpression: getUpdateExpression(request),
            ExpressionAttributeValues: expressionAttrs,
            ConditionExpression: 'attribute_not_exists(deletedAt)' //TODO userId <> :u AND 
        };
        return new Promise(resolve => {
            getDynamoDb().updateItem(updateComment, (err, _data) => {
                if (err) {
                    if (err.code === 'ConditionalCheckFailedException') {
                        resolve(errorResult(403, 'Not authorized to edit'));
                    }
                    else {
                        resolve(errorResult(500, 'Server error'));
                    }
                }
                else {
                    resolve(successResult({success: true}));
                }
            })
        });
    }
});
