import { COMMENT_ID_PREFIX, DynamoComment, getDynamoDb, PAGE_ID_PREFIX, parseContinuationToken, removeCommentIdPrefix } from './aws';
import { ItemList } from 'aws-sdk/clients/dynamodb';
import { createHandler, errorResult, successResult } from './common';

import type { GetAllCommentsResponse, Comment } from '../common/types/get-all-comments-response';
import type { QueryInput } from 'aws-sdk/clients/dynamodb';
import { limitQuery } from './dynamo';

const DELETED_AUTHOR = 'Anonymous';
const DELETED_AUTHOR_ID = 'ANONYMOUS';

const PAGE_SIZE = 20;

export const handler = createHandler({
    hasJsonBody: false,
    requiresAuth: false,
    handle: async event => {
        const url = decodeURIComponent(event.pathParameters.url);
        const params: QueryInput = {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: 'PK = :u', 
            ExpressionAttributeValues: {
                ':u': { S: PAGE_ID_PREFIX + url },
                ':t': { S: COMMENT_ID_PREFIX + event.pathParameters.comment }
            },
            Limit: PAGE_SIZE,
            FilterExpression: 'attribute_not_exists(deletedAt) AND threadId = :t',
            Select: 'ALL_ATTRIBUTES'
        };

        try {
            const queryResult = await limitQuery(getDynamoDb(), params, PAGE_SIZE, parseContinuationToken(event));
            const response: GetAllCommentsResponse = {
                comments: convertItems(queryResult.items),
                continuationToken: queryResult.continuationToken
            };
            return successResult(response);
        } catch (err) {
            return errorResult(500, err.message);
        }
    }
});

function convertItems(items: ItemList): Comment[] {
    return items.sort((a, b) => a.timestamp.S.localeCompare(b.timestamp.S)).map((item: DynamoComment) => {
        const isDeleted = !!(item.deletedAt?.S);
        const isEdited = !!(item.editedAt?.S);

        const comment: Comment = {
            id: removeCommentIdPrefix(item.SK.S),
            author: {
                id: isDeleted ? DELETED_AUTHOR_ID : item.userId.S,
                name: isDeleted ? DELETED_AUTHOR : item.author.S
            },
            text: isDeleted ? '' : item.commentText.S,
            timestamp: item.timestamp.S,
            status: isDeleted ? 'deleted' : (isEdited ? 'edited' : 'normal'),
            votes: {
                upvoters: isDeleted ? [] : (item?.upvoters?.SS ?? []),
                downvoters: isDeleted ? [] : (item?.downvoters?.SS ?? [])
            },
            replies: {
                count: Number(item.numReplies.N ?? 0)
            }
        };
        return comment;
    })
    .filter(comment => comment.status !== 'deleted');
}
