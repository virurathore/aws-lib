"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authUser = authUser;
exports.signOutUser = signOutUser;
exports.authUser2 = authUser2;
exports.s3Upload = s3Upload;
exports.signOutUser2 = signOutUser2;
exports.dynamoCall = dynamoCall;

var _amazonCognitoIdentityJs = require("amazon-cognito-identity-js");

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

async function authUser(awsConfig) {
  var currentUser = getCurrentUser(awsConfig);
  if (currentUser === null) {
    return false;
  }
  await getUserToken(currentUser);
  return true;
}
function getUserToken(currentUser) {
  return new Promise(function (resolve, reject) {
    currentUser.getSession(function (err, session) {
      if (err) {
        reject(err);
        return;
      }
      resolve(session.getIdToken().getJwtToken());
    });
  });
}
function getCurrentUser(awsConfig) {
  var userPool = new _amazonCognitoIdentityJs.CognitoUserPool({
    UserPoolId: awsConfig.cognito.USER_POOL_ID,
    ClientId: awsConfig.cognito.APP_CLIENT_ID
  });
  return userPool.getCurrentUser();
}
function signOutUser(awsConfig) {
  var currentUser = getCurrentUser(awsConfig);
  if (currentUser !== null) {
    currentUser.signOut();
  }
}

function getAwsCredentials(userToken, awsConfig) {
  var authenticator = "cognito-idp." + awsConfig.cognito.REGION + ".amazonaws.com/" + awsConfig.cognito.USER_POOL_ID;
  _awsSdk2.default.config.update({ region: awsConfig.cognito.REGION });
  _awsSdk2.default.config.credentials = new _awsSdk2.default.CognitoIdentityCredentials({
    IdentityPoolId: awsConfig.cognito.IDENTITY_POOL_ID,
    Logins: _defineProperty({}, authenticator, userToken)
  });
  return _awsSdk2.default.config.credentials.getPromise();
}

async function authUser2(awsConfig) {
  if (_awsSdk2.default.config.credentials && Date.now() < _awsSdk2.default.config.credentials.expireTime - 60000) {
    return true;
  }
  var currentUser = getCurrentUser(awsConfig);
  if (currentUser === null) {
    return false;
  }
  var userToken = await getUserToken(currentUser);
  await getAwsCredentials(userToken);
  return true;
}

async function s3Upload(file) {
  if (!(await authUser())) {
    throw new Error("User is not logged in");
  }
  var s3 = new _awsSdk2.default.S3({
    params: {
      Bucket: config.s3.BUCKET
    }
  });
  var filename = _awsSdk2.default.config.credentials.identityId + "-" + Date.now() + "-" + file.name;
  return s3.upload({
    Key: filename,
    Body: file,
    ContentType: file.type,
    ACL: "public-read"
  }).promise();
}
function signOutUser2(awsConfig) {
  var currentUser = getCurrentUser(awsConfig);
  if (currentUser !== null) {
    currentUser.signOut();
  }
  if (_awsSdk2.default.config.credentials) {
    _awsSdk2.default.config.credentials.clearCachedId();
    _awsSdk2.default.config.credentials = new _awsSdk2.default.CognitoIdentityCredentials({});
  }
}

function dynamoCall(action, params) {
  var dynamoDb = new _awsSdk2.default.DynamoDB.DocumentClient();
  return dynamoDb[action](params).promise();
}