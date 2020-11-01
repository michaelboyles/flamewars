import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";
import * as AWS from 'aws-sdk';

export interface ApiGatewayRequest {
    body: string;
    queryStringParameters: any;
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
    comment: DynamoString;
    parent: DynamoString;
    timestamp: DynamoString;
    author: DynamoString;
    userId: DynamoString;
    isDeleted: DynamoBoolean;
}

export function getDynamoDb() {
    AWS.config.update({region: 'eu-west-2'});
    return new AWS.DynamoDB({apiVersion: '2012-08-10'});
}
