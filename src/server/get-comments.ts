import { ApiGatewayRequest, DynamoComment, getDynamoDb, getRequestUrl, PAGE_ID_PREFIX, parseContinuationToken, removeCommentIdPrefix } from './aws';
import { createHandler, errorResult, successResult } from './common';
import { limitQuery } from './dynamo';

import type { GetAllCommentsResponse, Comment } from '../common/types/get-all-comments-response';
import type { ItemList, QueryInput } from 'aws-sdk/clients/dynamodb';

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
            ScanIndexForward: true,
            ExpressionAttributeValues: {
                ':u': { S: PAGE_ID_PREFIX + url },
                ':zero': { N: '0'}
            },
            // only top-level comments
            FilterExpression: 'attribute_not_exists(threadId) AND (attribute_not_exists(deletedAt) OR numReplies > :zero)',
            Select: 'ALL_ATTRIBUTES'
        };

        try {
            const queryResult = await limitQuery(getDynamoDb(), params, PAGE_SIZE, parseContinuationToken(event));
            const response: GetAllCommentsResponse = {
                comments: convertItems(event, queryResult.items),
                continuationToken: queryResult.continuationToken
            }
            return successResult(response);
        }
        catch (err) {
            return errorResult(500, err.message);
        }
    }
});

function convertItems(request: ApiGatewayRequest, items: ItemList): Comment[] {
    return items.sort((a, b) => a.timestamp.S.localeCompare(b.timestamp.S)).map((item: DynamoComment) => {
        const isDeleted = !!(item.deletedAt?.S);
        const isEdited = !!(item.editedAt?.S);

        const id = removeCommentIdPrefix(item.SK.S);
        const numReplies = Number(item.numReplies.N);
        const comment: Comment = {
            id,
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
                uri: numReplies > 0 ? getRequestUrl(request) + `/${id}/replies` : undefined,
                count: numReplies
            }
        };
        return comment;
    });
}
