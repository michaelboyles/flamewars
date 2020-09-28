package com.github.michaelboyles.awsh;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.spec.PutItemSpec;
import com.amazonaws.services.dynamodbv2.model.ConditionalCheckFailedException;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.michaelboyles.awsh.json.PostCommentRequest;
import com.github.michaelboyles.awsh.json.PostCommentResponse;
import lombok.SneakyThrows;

import java.util.Collections;

public class CommentRequestHandler implements RequestHandler<ApiGatewayWrappedCommentRequest, ApiGatewayResponse>
{
    @SneakyThrows
    public ApiGatewayResponse handleRequest(ApiGatewayWrappedCommentRequest request, Context context)
    {
        saveComment(getDynamoDb(), request.getBody());
        return new ApiGatewayResponse(
            false,
            200,
            Collections.emptyMap(),
            new ObjectMapper().writeValueAsString(request)
        );
    }

    private DynamoDB getDynamoDb()
    {
        return new DynamoDB(
            AmazonDynamoDBClientBuilder.standard()
                .withRegion(Regions.EU_WEST_2)
                .build()
        );
    }

    private PutItemOutcome saveComment(DynamoDB dynamoDB, PostCommentRequest request) throws ConditionalCheckFailedException
    {
        return dynamoDB.getTable("COMMENTS")
            .putItem(
                new PutItemSpec().withItem(
                    new Item()
                        .withString("comment", request.getComment())
                        .withString("parent", request.getInReplyTo())
                )
            );
    }

    private static PostCommentResponse getResponse()
    {
        final PostCommentResponse response = new PostCommentResponse();
        response.setSuccess(true);
        return response;
    }
}