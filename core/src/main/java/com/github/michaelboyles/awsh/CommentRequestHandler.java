package com.github.michaelboyles.awsh;

import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.spec.PutItemSpec;
import com.amazonaws.services.dynamodbv2.model.ConditionalCheckFailedException;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.github.michaelboyles.awsh.json.PostCommentRequest;
import com.github.michaelboyles.awsh.json.PostCommentResponse;

public class CommentRequestHandler implements RequestHandler<PostCommentRequest, PostCommentResponse>
{
    public PostCommentResponse handleRequest(PostCommentRequest request, Context context)
    {
        saveComment(getDynamoDb(), request);
        return getResponse();
    }

    private DynamoDB getDynamoDb()
    {
        final AmazonDynamoDBClient client = new AmazonDynamoDBClient();
        client.setRegion(Region.getRegion(Regions.EU_WEST_1));
        return new DynamoDB(client);
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