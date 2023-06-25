**Local development:**

1. Provide your AWS account id.

2. Bootstrap your AWS account for CDK: `npx cdk bootstrap aws://<Account ID>/<AWS region>`. Also bootstrap the `us-east-1` region.

3. Copy `.env.local.example` to `.env.local` and set variables.

4. Start Docker.

5. `npm install`.

6. `AWS_PROFILE=<your profile> npm run deploy:dev`.

7. `npm start`