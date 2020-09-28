package com.github.michaelboyles.awsh;

import lombok.Data;

import java.util.Map;

@Data
class ApiGatewayResponse
{
    private final boolean isBase64Encoded;
    private final int statusCode;
    private final Map<String, String> headers;
    private final String body;
}
