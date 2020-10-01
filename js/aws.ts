export interface ApiGatewayRequest {
    body: string;
    queryStringParameters: any;
}

export interface ApiGatewayResponse {
    statusCode: number;
    body: string;
}