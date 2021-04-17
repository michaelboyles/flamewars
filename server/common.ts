import { ApiGatewayResponse } from "./aws"

import type { ErrorResponse } from '../common/types/error'

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
};

export function getSuccessResponse(statusCode: number, body: object, extraHeaders: Record<string, string> = {}): ApiGatewayResponse {
    return {
        statusCode,
        headers: {...CORS_HEADERS, ...extraHeaders},
        body: JSON.stringify(body)
    };
}

export function getErrorResponse(statusCode: number, message: string): ApiGatewayResponse {
    const body: ErrorResponse = {
        error: message
    };

    return {
        statusCode,
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    };
}
