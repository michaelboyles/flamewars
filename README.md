![GitHub Workflow Status](https://img.shields.io/github/workflow/status/michaelboyles/flamewars/Node.js%20build) ![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/michaelboyles/flamewars?sort=semver) ![License](https://img.shields.io/github/license/michaelboyles/flamewars)

Flamewars is a [serverless](https://en.wikipedia.org/wiki/Serverless_computing) comment engine. You host it yourself in AWS. It's
designed for websites which run without their own server, like a statically generated website (Hugo, Jekyll) served on
[GitHub Pages](https://pages.github.com/). You can install it in just a few minutes.

Comments support [markdown](https://en.wikipedia.org/wiki/Markdown), including lists, code blocks and images.

A serverless architecture allows you to pay only for what you use. For a small or medium-sized blog with a relatively low number of
visitors, that's likely to be much more cost-effective than a subscription and can even be free.

## Installation

### Server installation

 1. If you don't have one, create a [Google client ID](https://console.cloud.google.com/apis/credentials/oauthclient). See [these instructions](https://developers.google.com/identity/protocols/oauth2/). Make note of the ID ending with `apps.googleusercontent.com`.
 2. Log in to [AWS](https://aws.amazon.com). [Create an S3 bucket](https://s3.console.aws.amazon.com/) to store the server code, or you can use
 an existing one.
 3. Upload the `flamewars.zip` file and `cft.yml` template.
 4. When they have uploaded, click `cft.yml` and copy the 'Object URL' beginning with `https://`.
 5. Open [CloudFormation](https://console.aws.amazon.com/cloudformation), click 'Create stack' > 'With new resources (standard)'.
 6. Under the section 'Specify Template', for the field 'Amazon S3 URL' paste the value you copied in step 3. Click next.
 7. Give the stack a name. 'flamewars' will usually be fine. The stack name will be prepended to some resources to prevent name clashes.
 8. Enter a value for each of the parameters. Click next.
 9. On the 'Configure stack options' page, no changes are required. Click next.
 10. Check the checkbox confirming "*I acknowledge that AWS CloudFormation might create IAM resources with custom names*". The template sets
 up some permissions to allow the lambda functions to connect to the DynamoDB database and this is just confirming that you're okay with that.
 11. Click 'Create stack' and wait for the resources to be created.
 12. On the 'Outputs' tab, copy the URL which is generated; you'll need it when setting up the client. You're done!

### Client setup

1. Add a `<div>` to hold the comments
2. Add a script to set the config (see [config.ts](https://github.com/michaelboyles/flamewars/blob/develop/client/config.ts) for valid config properties)
3. Include the client JS

```html
<div id="comments"></div>
<script type="application/javascript">
__FLAMEWARS_CONFIG = {
    awsUrl: 'https://abcdefg.execute-api.eu-west-2.amazonaws.com/default',
    googleClientId: '123456789012-abcdefghijklmnopqrstuvwxyzabcdefg.apps.googleusercontent.com'
};
</script>
<script type="application/javascript" src="/path/to/flamewars.js"></script>
```

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
 
Here are some alternative projects which may work for you. For various reasons, I decided not to use them.

 - [Disqus](https://disqus.com/): ad-supported or fixed monthly subscription
 - [Commento](https://commento.io/): subscription, or requires a server running 24/7
 - [Utterances](https://github.com/utterance/utterances): commenters require GitHub, and must authorize the app
 - [Lambda Comments](https://github.com/jimpick/lambda-comments): not maintained, lacks features, difficult installation
 - [ISSO](https://posativ.org/isso/docs/install/): requires a server
