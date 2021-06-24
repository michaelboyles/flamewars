import { AttributeValue, PutItemInputAttributeMap } from 'aws-sdk/clients/dynamodb';
import { config, DynamoDB } from 'aws-sdk';
import { MAX_DB_FIELD_LENGTH } from '../constants';

export const PAGE_ID_PREFIX: string = 'PAGE#';
export const COMMENT_ID_PREFIX: string = '#COMMENT#';

export interface ApiGatewayRequest {
    body: string;
    queryStringParameters: Record<string, string>;
    pathParameters: Record<string, string>;
    requestContext: {
        domainName: string;
        path: string;
    };
    headers: Record<string, string>;
}

export interface ApiGatewayResponse {
    statusCode: number;
    headers?: object,
    body: string;
}

export interface DynamoString {
    S: string;
}

export interface DynamoStringSet {
    SS: string[];
}

export interface DynamoBoolean {
    BOOL: boolean;
}

export interface DynamoComment extends PutItemInputAttributeMap {
    PK: DynamoString;
    SK: DynamoString;
    pageUrl: DynamoString;
    commentText: DynamoString;
    timestamp: DynamoString;
    author: DynamoString;
    userId: DynamoString;
    threadId?: DynamoString;
    parentId?: DynamoString;
    deletedAt?: DynamoString;
    editedAt?: DynamoString;
    upvoters?: DynamoStringSet;
    downvoters?: DynamoStringSet;
}

export function getDynamoDb() {
    config.update({region: 'eu-west-2'});
    return new DynamoDB({apiVersion: '2012-08-10'});
}

// Check whether string fields are too long to be saved in DynamoDB
export function getOverlongFields(fieldMap: Record<string, AttributeValue>, ignoreKeys: string[]): string[] {
    return Object.entries(fieldMap)
        .map(([field, value]) => (value?.S?.length ?? 0) > MAX_DB_FIELD_LENGTH ? field : null)
        .filter(field => Boolean(field) && !ignoreKeys.includes(field));
}

export function getContentType(event: ApiGatewayRequest) {
    for (var key in event.headers){
        if (key.toLowerCase() === 'content-type') {
            return event.headers[key];
        }
    }
    return undefined;
}
