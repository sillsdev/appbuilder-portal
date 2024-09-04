# Testing AWS Step Functions Locally

1. If you don't already have the AWS Local Step Functions Docker Image, `docker pull amazon/aws-stepfunctions-local`
1. Create a `.env` file with these contents.
```
AWS_DEFAULT_REGION=dummy
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
```
3. `npm i`
3. `npm start`
3. Use Postman to interact with the REST API
