import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { MAX_DB_FIELD_LENGTH } from '../../common/constants';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import type { AttributeMap, DynamoKey } from "./dynamo";

export const PAGE_ID_PREFIX: string = 'PAGE#';
export const COMMENT_ID_PREFIX: string = '#COMMENT#';

export type ApiGatewayRequest = {
    body: string
    queryStringParameters: Record<string, string>
    pathParameters: Record<string, string>
    requestContext: {
        domainName: string
        path: string
    };
    headers: Record<string, string>
}

export type ApiGatewayResponse = {
    statusCode: number
    body: string
    headers?: object
}

export type DynamoString = {
    S: string
}

export type DynamoStringSet = {
    SS: string[]
}

export type DynamoBoolean = {
    BOOL: boolean
}

export type DynamoNumber = {
    N: string
}

export interface DynamoComment extends AttributeMap {
    PK: DynamoString
    SK: DynamoString
    pageUrl: DynamoString
    commentText: DynamoString
    timestamp: DynamoString
    author: DynamoString
    userId: DynamoString
    numReplies: DynamoNumber

    // @ts-ignore
    threadId?: DynamoString
    // @ts-ignore
    parentId?: DynamoString
    // @ts-ignore
    deletedAt?: DynamoString
    // @ts-ignore
    editedAt?: DynamoString
    // @ts-ignore
    upvoters?: DynamoStringSet
    // @ts-ignore
    downvoters?: DynamoStringSet
}

export function getDynamoDb() {
    return new DynamoDB({apiVersion: '2012-08-10'});
}

// Check whether string fields are too long to be saved in DynamoDB
export function getOverlongFields(fieldMap: Record<string, AttributeValue>, ignoreKeys: string[]): string[] {
    return Object.entries(fieldMap)
        .map(([field, value]) => (value?.S?.length ?? 0) > MAX_DB_FIELD_LENGTH ? field : null)
        .filter(field => field != null)
        .filter(field => !ignoreKeys.includes(field))
}

export function getContentType(event: ApiGatewayRequest) {
    for (let key in event.headers) {
        if (key.toLowerCase() === 'content-type') {
            return event.headers[key];
        }
    }
    return undefined;
}

export function removeCommentIdPrefix(id: string) {
    return id.substring(COMMENT_ID_PREFIX.length);
}

export function continuationTokenToStr(key: DynamoKey | undefined): string | undefined {
    if (key) {
        const keyStr = JSON.stringify(key);
        return Buffer.from(keyStr).toString('base64');
    }
    return undefined;
}

export function parseContinuationToken(event: ApiGatewayRequest) {
    if (event?.queryStringParameters?.continuationToken) {
        const buffer = Buffer.from(event.queryStringParameters.continuationToken, 'base64');
        const key = JSON.parse(buffer.toString('ascii'));
        // If it doesn't have these fields, it's a bad request
        if (key?.PK?.S && key?.SK?.S) {
            return key;
        }
    }
    return undefined;
}

export function getRequestUrl(event: ApiGatewayRequest) {
    return `https://${event.requestContext.domainName}${event.requestContext.path}`;
}
