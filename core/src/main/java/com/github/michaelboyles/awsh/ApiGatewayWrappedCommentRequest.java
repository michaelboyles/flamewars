package com.github.michaelboyles.awsh;

import com.fasterxml.jackson.annotation.JsonRawValue;
import com.github.michaelboyles.awsh.json.PostCommentRequest;
import lombok.Data;

@Data
public class ApiGatewayWrappedCommentRequest
{
    @JsonRawValue
    private PostCommentRequest body;
}
