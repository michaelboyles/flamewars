Flamewars is a serverless comment engine designed for statically generated blogs (Hugo, Jekyll). It is designed to be hosted in AWS.

A serverless architecture allows for a pay-for-what-you-use payment model. For most small blogs, especially those just starting
out, this is likely to be more cost-effective than a subscription.

Most components are available on the AWS free tier, meaning that for any reasonable usage you won't pay anything for them.

 - API Gateway
 - DynamoDB - Free tier (always free up to 25GB, 200M requests per month)
 - Lambda - Free tier (always free up to 1M invocations per month)
 - CloudFormation - Free

## Alternatives
 
 - [Disqus](https://disqus.com/): ad-supported or fixed monthly subscription
 - [Commento](https://commento.io/): subscription, or requires a server running 24/7
 - [Utterances](https://github.com/utterance/utterances): commenters require GitHub
 - [Lambda Comments](https://github.com/jimpick/lambda-comments) - Not maintained, difficult installation
 - [ISSO](https://posativ.org/isso/docs/install/) - requires a server
 
