import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";
import * as AWS from 'aws-sdk';

export const PAGE_ID_PREFIX: string = 'PAGE#';
export const COMMENT_ID_PREFIX: string = '#COMMENT#';

export interface ApiGatewayRequest {
    body: string;
    queryStringParameters: any;
    pathParameters: any;
}

export interface ApiGatewayResponse {
    statusCode: number;
    headers?: object,
    body: string;
}

export interface DynamoString {
    S: string;
}

export interface DynamoBoolean {
    BOOL: boolean;
}

export interface DynamoComment extends PutItemInputAttributeMap {
    PK: DynamoString;
    SK: DynamoString;
    pageUrl: DynamoString;
    commentText: DynamoString;
    parent: DynamoString;
    timestamp: DynamoString;
    author: DynamoString;
    userId: DynamoString;
    deletedAt?: DynamoString;
    editedAt?: DynamoString;
}

export function getDynamoDb() {
    AWS.config.update({region: 'eu-west-2'});
    return new AWS.DynamoDB({apiVersion: '2012-08-10'});
}
