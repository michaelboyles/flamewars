var AWS = require('aws-sdk');
AWS.config.update({region: 'eu-west-2'});

var dynamo = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler =  async function(event, context) {
    var request = JSON.parse(event.body);

    var params = {
        TableName: 'COMMENTS',
        Item: {
            'id': { S: new Date().toISOString() },
            'comment' : {S: request.comment },
            'parent'  : {S: request.inReplyTo }
        }
    };

    return dynamo.putItem(params)
        .promise()
        .then(() => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({"success": true}),
            };
            return response;
        });
}
