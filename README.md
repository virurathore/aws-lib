# aws-lib
This is used to access aws resource
 login, signup, logout, access api-getway.


## AWSConfig
you need to create awsConfig object in following format.
```
export default {
  s3: {
    BUCKET: "YOUR_S3_UPLOADS_BUCKET_NAME"
  },
  apiGateway: {
    URL: "YOUR_API_GATEWAY_URL",
    REGION: "YOUR_API_GATEWAY_REGION"
  },
  cognito: {
    USER_POOL_ID: "YOUR_COGNITO_USER_POOL_ID",
    APP_CLIENT_ID: "YOUR_COGNITO_APP_CLIENT_ID",
    REGION: "YOUR_COGNITO_REGION",
    IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID"
  }
};
```
