import { PutItemInputAttributeMap } from "aws-sdk/clients/dynamodb";

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

export interface DynamoComment extends PutItemInputAttributeMap {
    PK: DynamoString;
    SK: DynamoString;
    pageUrl: DynamoString;
    comment: DynamoString;
    parent: DynamoString;
    timestamp: DynamoString;
    author: DynamoString;
    userId: DynamoString;
}