[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/michaelboyles/flamewars/node.js.yml?branch=develop)](https://github.com/michaelboyles/flamewars/actions) ![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/michaelboyles/flamewars?sort=semver) [![License](https://img.shields.io/github/license/michaelboyles/flamewars)](https://github.com/michaelboyles/flamewars/blob/develop/LICENSE)

Flamewars is a [serverless](https://en.wikipedia.org/wiki/Serverless_computing) comment engine. You self-host an instance in AWS. It's
designed for websites which run without their own server, like a statically generated website (Hugo, Jekyll) served on
[GitHub Pages](https://pages.github.com/). You can install it in just a few minutes.

<p align="center">👉&nbsp;<a href="https://boyl.es/">Try it out on my blog<a> 👈</p>

Comments support [markdown](https://en.wikipedia.org/wiki/Markdown), including lists, code blocks and images.

A serverless architecture allows you to pay only for what you use. For a small or medium-sized blog with a relatively low number of
visitors, that's likely to be much more cost-effective than a subscription and can even be free.

### 💿 Installation

*Flamewars is currently in pre-release so there are no published packages.* When there are, the full setup takes just a couple of minutes.
 
1. [Set up the backend](https://github.com/michaelboyles/flamewars/wiki/AWS-Installation-Instructions)
2. [Set up the frontend](https://github.com/michaelboyles/flamewars/wiki/Client-Setup)

### 💵 Cost

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

### 🌐 Alternatives
 
Here are some alternative projects which may work for you. For various reasons, I preferred not to use them.

 - [Disqus](https://disqus.com/): ad-supported or fixed monthly subscription
 - [Commento](https://commento.io/): subscription, or requires a server running 24/7
 - [Utterances](https://github.com/utterance/utterances): commenters require GitHub and must authorize the app
 - [Lambda Comments](https://github.com/jimpick/lambda-comments): not maintained, lacks features, difficult installation
 - [ISSO](https://posativ.org/isso/docs/install/): requires a server
