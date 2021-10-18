import { ApiGatewayRequest, ApiGatewayResponse, getContentType } from './aws';
import { AuthenticationResult, checkAuthentication } from './user-details';

import type { Handler } from 'aws-lambda';
import type { ErrorResponse } from '../../common/types/error';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,PATCH'
};

export type HandlerResult = {
    statusCode: number,
    body: object,
    extraHeaders?: Record<string, string>
};

export function successResult(body: object): HandlerResult {
    return { statusCode: 200, body };
};

export function errorResult(statusCode: number, message: string): HandlerResult {
    const body: ErrorResponse = { error: message };
    return { statusCode, body };
};

function resultToResponse(result: HandlerResult): ApiGatewayResponse {
    return {
        statusCode: result.statusCode,
        headers: {...CORS_HEADERS, ...result?.extraHeaders},
        body: JSON.stringify(result.body)
    };
}

export function createHandler<RequestBody>(params: {
    hasJsonBody: boolean,
    requiresAuth: boolean,
    handle: (event: ApiGatewayRequest, jsonBody: RequestBody, authResult: AuthenticationResult) => (HandlerResult | Promise<HandlerResult>)
}): Handler<ApiGatewayRequest, ApiGatewayResponse> {
    return async (event, _ctx) => {
        let jsonBody: RequestBody;
        let authResult: AuthenticationResult;

        if (params.hasJsonBody) {
            if (getContentType(event) !== 'application/json') {
                return resultToResponse(
                    errorResult(400, 'Invalid Content-Type, must be application/json')
                );
            }
            try {
                jsonBody = JSON.parse(event.body);
            } 
            catch (err) {
                return resultToResponse(
                    errorResult(400, 'Invalid JSON body')
                );
            }

            if (params.requiresAuth) {
                authResult = await checkAuthentication((jsonBody as any)?.authorization);
                if (!authResult.isValid) {
                    return resultToResponse(errorResult(403, 'Invalid authentication token'));
                }
            }
        }
        return resultToResponse(await params.handle(event, jsonBody, authResult));
    };
}
