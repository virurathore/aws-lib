import { CognitoUserPool } from "amazon-cognito-identity-js";
import AWS from "aws-sdk";

export async function authUser(awsConfig) {
  const currentUser = getCurrentUser(awsConfig);
  if (currentUser === null) {
    return false;
  }
  await getUserToken(currentUser);
  return true;
}
function getUserToken(currentUser) {
  return new Promise((resolve, reject) => {
    currentUser.getSession(function(err, session) {
      if (err) {
        reject(err);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}
function getCurrentUser(awsConfig) {
  const userPool = new CognitoUserPool({
    UserPoolId: awsConfig.cognito.USER_POOL_ID,
    ClientId: awsConfig.cognito.APP_CLIENT_ID
  });
  return userPool.getCurrentUser();
}
export function signOutUser(awsConfig) {
  const currentUser = getCurrentUser(awsConfig);
  if (currentUser !== null) {
    currentUser.signOut();
  }
}

function getAwsCredentials(userToken, awsConfig) {
  const authenticator = `cognito-idp.${awsConfig.cognito.REGION}.amazonaws.com/${
    awsConfig.cognito.USER_POOL_ID
  }`;
  AWS.config.update({ region: awsConfig.cognito.REGION });
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsConfig.cognito.IDENTITY_POOL_ID,
    Logins: {
      [authenticator]: userToken
    }
  });
  return AWS.config.credentials.getPromise();
}

export async function authUser2(awsConfig) {
  if (
    AWS.config.credentials &&
    Date.now() < AWS.config.credentials.expireTime - 60000
  ) {
    return true;
  }
  const currentUser = getCurrentUser(awsConfig);
  if (currentUser === null) {
    return false;
  }
  const userToken = await getUserToken(currentUser);
  await getAwsCredentials(userToken);
  return true;
}


export async function s3Upload(file) {
  if (!await authUser()) {
    throw new Error("User is not logged in");
  }
  const s3 = new AWS.S3({
    params: {
      Bucket: config.s3.BUCKET
    }
  });
  const filename = `${AWS.config.credentials.identityId}-${Date.now()}-${
    file.name
  }`;
  return s3
    .upload({
      Key: filename,
      Body: file,
      ContentType: file.type,
      ACL: "public-read"
    })
    .promise();
}
export function signOutUser2(awsConfig) {
  const currentUser = getCurrentUser(awsConfig);
  if (currentUser !== null) {
    currentUser.signOut();
  }
  if (AWS.config.credentials) {
    AWS.config.credentials.clearCachedId();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({});
  }
}

export function dynamoCall(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
  }
