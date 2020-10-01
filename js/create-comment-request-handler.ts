import type { PostCommentRequest } from './dist/post-comment-request'

interface ApiGatewayRequest{
    body : string;
}

interface ApiGatewayResponse {
    statusCode: number;
    body : string;
}

const AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const handler = async function(event : ApiGatewayRequest, context) {
    const request : PostCommentRequest = JSON.parse(event.body);

    if (!isValid) {
        const response: ApiGatewayResponse = {
            statusCode: 400,
            body: JSON.stringify({"success": false})
        };
        return response;
    }

    const params = {
        TableName: 'COMMENTS',
        Item: {
            'id'        : { S: new Date().toISOString()  }, //TODO uuid?
            'url'       : { S: request.url               },
            'comment'   : { S: request.comment           },
            'parent'    : { S: request.inReplyTo         },
            'timestamp' : { S : new Date().toISOString() }
        }
    };

    return dynamo.putItem(params)
        .promise()
        .then(() => {
            const response: ApiGatewayResponse = {
                statusCode: 200,
                body: JSON.stringify({"success": true})
            };
            return response;
        });
}

function isValid(request: PostCommentRequest){
    return request.url && request.comment && request.authorization;
}