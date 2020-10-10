import type { PostCommentRequest } from '../dist/post-comment-request'
import type { ApiGatewayRequest, ApiGatewayResponse, DynamoComment } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'
import { PutItemInput } from 'aws-sdk/clients/dynamodb';

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const responseHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8080',
    'Access-Control-Allow-Methods': 'POST'
};

export const handler: Handler = async function(event: ApiGatewayRequest, context) {
    const request : PostCommentRequest = JSON.parse(event.body);

    if (!isValid) {
        return {
            statusCode: 400,
            headers: responseHeaders,
            body: JSON.stringify({"success": false})
        } as ApiGatewayResponse;
    }

    const params: PutItemInput = {
        TableName: 'COMMENTS',
        Item: {
            'id'       : { S: new Date().toISOString()  }, //TODO uuid?
            'pageUrl'  : { S: request.url               },
            'comment'  : { S: request.comment           },
            'parent'   : { S: request.inReplyTo         },
            'timestamp': { S: new Date().toISOString()  }
        } as DynamoComment
    };

    return dynamo.putItem(params)
        .promise()
        .then(() => {
            return {
                statusCode: 200,
                headers: responseHeaders,
                body: JSON.stringify({"success": true})
            } as ApiGatewayResponse;
        });
}

function isValid(request: PostCommentRequest){
    return request.url && request.comment && request.authorization;
}