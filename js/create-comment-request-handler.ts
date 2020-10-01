import type { PostCommentRequest } from './dist/post-comment-request'
import type { ApiGatewayRequest, ApiGatewayResponse } from './aws';
import * as AWS from 'aws-sdk';
import type { Handler } from 'aws-lambda'

AWS.config.update({region: 'eu-west-2'});

const dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export const handler: Handler = async function(event: ApiGatewayRequest, context) {
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
            'id'       : { S: new Date().toISOString()  }, //TODO uuid?
            'pageUrl'  : { S: request.url               },
            'comment'  : { S: request.comment           },
            'parent'   : { S: request.inReplyTo         },
            'timestamp': { S: new Date().toISOString()  }
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