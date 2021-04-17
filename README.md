Flamewars is a [serverless](https://en.wikipedia.org/wiki/Serverless_computing) comment engine. You host it yourself in AWS. It is
designed for websites which run without their own server, for example a statically generated blog or website (Hugo, Jekyll) served
on [GitHub Pages](https://pages.github.com/). You can install it in just a few minutes.

Comments support [markdown](https://en.wikipedia.org/wiki/Markdown), including lists, code blocks and images.

A serverless architecture allows you to pay only for what you use. For a small or medium-sized blog with a relatively low number of
visitors, this is likely to be much more cost-effective than a subscription (or even completely free).

## Installation

### Server installation

 1. Log in to [AWS](https://aws.amazon.com). [Create an S3 bucket](https://s3.console.aws.amazon.com/) to store the server code, or you can use
 an existing one.
 2. Upload the `flamewars.zip` file and `cft.yml` template.
 3. When they have uploaded, click `cft.yml` and copy the 'Object URL' beginning with `https://`.
 3. Open [CloudFormation](https://console.aws.amazon.com/cloudformation), click 'Create stack' > 'With new resources (standard)'.
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

## Cost

Most services are available on the AWS free tier, meaning that for any reasonable usage you won't pay anything for them.

 - API Gateway
 - DynamoDB - free tier (always free up to 25GB, 200M requests per month)
 - Lambda - free tier (always free up to 1M invocations per month)
 - S3 - few cents per GB, code uses less than 1MB. Free for the first year
 - CloudFormation - free

Although some of the services here are not on the free tier, AWS will waive charges below a certain value as it's not worth them
collecting such small amounts. If your bill totals a few cents then you will pay nothing at all.

It is always worth [setting billing alarms and budgets](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/checklistforunwantedcharges.html)
to ensure you don't run into any nasty surprises.

## Alternatives
 
Here are some alternative projects which may work for you. For various reasons, they didn't work for me.

 - [Disqus](https://disqus.com/): ad-supported or fixed monthly subscription
 - [Commento](https://commento.io/): subscription, or requires a server running 24/7
 - [Utterances](https://github.com/utterance/utterances): commenters require GitHub
 - [Lambda Comments](https://github.com/jimpick/lambda-comments) - Not maintained, difficult installation
 - [ISSO](https://posativ.org/isso/docs/install/) - requires a server
