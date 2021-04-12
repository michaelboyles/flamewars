Flamewars is a serverless comment engine designed for statically generated blogs (Hugo, Jekyll). It is designed to be hosted in AWS.

A serverless architecture allows for a pay-for-what-you-use payment model. For most small blogs, especially those just starting
out, this is likely to be more cost-effective than a subscription. Comments lend themselves nicely to a serverless model because they
are not sensitive to cold starts.

Most services are available on the AWS free tier, meaning that for any reasonable usage you won't pay anything for them.

 - API Gateway
 - DynamoDB - free tier (always free up to 25GB, 200M requests per month)
 - Lambda - free tier (always free up to 1M invocations per month)
 - S3 - less than 1MB
 - CloudFormation - free

## Installation

Installation is easy and if you already have an AWS account should take just a few minutes.

### Server installation

 1. Log in to [AWS](https://aws.amazon.com). [Create an S3 bucket](https://s3.console.aws.amazon.com/) to store the server code, or you can use
 an existing one.
 2. Upload the `flamewars.zip` file and `cft.yml` template.
 3. When they have uploaded, click `cft.yml` and copy the 'Object URL' beginning with `https://`.
 3. Open CloudFormation, click 'Create stack' > 'With new resources (standard)'.
 5. Under the section 'Specify Template', for the field 'Amazon S3 URL' paste the value you copied in step 3. Click next.
 6. Give the stack a name. 'flamewars' will usually be fine. The stack name will be prepended to some resources to prevent name clashes.
 7. Enter a value for each of the parameters. Click next.
 8. On the 'Configure stack options' page, no changes are required. Click next.
 9. Check the checkbox confirming "*I acknowledge that AWS CloudFormation might create IAM resources with custom names*". The template sets
 up some permissions to allow the lambda functions to connect to the DynamoDB database and this is just confirming that you're okay with that.
 10. Click 'Create stack' and wait for the resources to be created.
 11. On the 'Outputs' tab, copy the URL which is generated; you'll need it when setting up the client. You're done!

### Client setup

TODO

### Uninstall

Uninstalling the server will delete the database, including all comments it contains. You may wish to export them first.

1. Log in to [AWS](https://aws.amazon.com) and navigate to CloudFormation.
2. Select the stack you created as part of the installation and click 'Delete'.

## Alternatives
 
Here are some alternative projects which may work for you. For various reasons, they didn't work for me.

 - [Disqus](https://disqus.com/): ad-supported or fixed monthly subscription
 - [Commento](https://commento.io/): subscription, or requires a server running 24/7
 - [Utterances](https://github.com/utterance/utterances): commenters require GitHub
 - [Lambda Comments](https://github.com/jimpick/lambda-comments) - Not maintained, difficult installation
 - [ISSO](https://posativ.org/isso/docs/install/) - requires a server
