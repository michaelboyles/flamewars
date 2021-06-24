import { COMMENT_ID_PREFIX, DynamoComment, getDynamoDb, PAGE_ID_PREFIX } from './aws';
import { ItemList, QueryOutput } from 'aws-sdk/clients/dynamodb';
import { createHandler, errorResult, successResult } from './common';

import type { GetAllCommentsResponse, Comment } from '../common/types/get-all-comments-response';
import type { QueryInput } from 'aws-sdk/clients/dynamodb';

const DELETED_AUTHOR = 'Anonymous';
const DELETED_AUTHOR_ID = 'ANONYMOUS';

export const handler = createHandler({
    hasJsonBody: false,
    requiresAuth: false,
    handle: event => {
        const url = decodeURIComponent(event.pathParameters.url);
        const params: QueryInput = {
            TableName: process.env.TABLE_NAME,
            KeyConditionExpression: "PK = :u", 
            ExpressionAttributeValues: {
                ':u': { S: PAGE_ID_PREFIX + url }
            }, 
            Select: 'ALL_ATTRIBUTES'
        };

        const dynamo = getDynamoDb();
        return new Promise(resolve => {
            dynamo.query(params, (err, data) => {
                if (err) {
                    resolve(errorResult(500, err.message));
                }
                else {
                    resolve(successResult(convertDataToResponse(data)));
                }
            })
        });
    }
});

function convertDataToResponse(data: QueryOutput): GetAllCommentsResponse {
    return {
        comments: sortToThreads(data.Items)
    };
}

function sortToThreads(items: ItemList): Comment[] {
    const idToComment: Record<string, Comment> = {};

    items.sort(commentComparator).forEach((item: DynamoComment) => {
        const isDeleted = !!(item.deletedAt?.S);
        const isEdited = !!(item.editedAt?.S);

        const isReply = Boolean(item.threadId) && Boolean(item.parentId);
        let replyFields = {};
        if (isReply) {
            const threadReplies = idToComment[item.threadId.S]?.replies ?? [];
            const parentId = removeCommentIdPrefix(item.parentId.S);
            const parent = threadReplies.find(reply => reply.id === parentId);
            const parentIsDeleted = parent?.status === 'deleted';
            replyFields = {
                inReplyTo: {
                    id: parentId,
                    author: parentIsDeleted ? undefined : parent?.author?.name
                }
            }
        }

        const comment: Comment = {
            id: removeCommentIdPrefix(item.SK.S),
            author: {
                id: isDeleted ? DELETED_AUTHOR_ID : item.userId.S,
                name: isDeleted ? DELETED_AUTHOR : item.author.S
            },
            text: isDeleted ? '' : item.commentText.S,
            timestamp: item.timestamp.S,
            status: isDeleted ? 'deleted' : (isEdited ? 'edited' : 'normal'),
            replies: [],
            votes: {
                upvoters: isDeleted ? [] : (item?.upvoters?.SS ?? []),
                downvoters: isDeleted ? [] : (item?.downvoters?.SS ?? [])
            },
            ...replyFields
        }
        
        if (isReply) {
            if (!isDeleted) {
                idToComment[item.threadId.S]?.replies?.push(comment);
            }
        }
        else {
            idToComment[item.SK.S] = comment; // Add even the deleted ones in case they have a reply
        }
    });
    return Object.values(idToComment).filter(comment => comment.status !== 'deleted' || comment.replies.length > 0);
}

function removeCommentIdPrefix(id: string) {
    return id.substr(COMMENT_ID_PREFIX.length);
}

// Sort root-level comments first, replies last, and then by time
function commentComparator(a: DynamoComment, b: DynamoComment) {
    if (Boolean(a.threadId) === Boolean(b.threadId)) {
        return a.timestamp.S.localeCompare(b.timestamp.S);
    }
    return a.threadId ? 1 : -1;
}
