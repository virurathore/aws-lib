"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = async function invokeApig(_ref) {
  var awsConfig = _ref.awsConfig,
      path = _ref.path,
      _ref$method = _ref.method,
      method = _ref$method === undefined ? "GET" : _ref$method,
      _ref$headers = _ref.headers,
      headers = _ref$headers === undefined ? {} : _ref$headers,
      _ref$queryParams = _ref.queryParams,
      queryParams = _ref$queryParams === undefined ? {} : _ref$queryParams,
      body = _ref.body;

  if (!(await authUser())) {
    throw new Error("User is not logged in");
  }
  var signedRequest = sigV4Client.newClient({
    accessKey: AWS.config.credentials.accessKeyId,
    secretKey: AWS.config.credentials.secretAccessKey,
    sessionToken: AWS.config.credentials.sessionToken,
    region: awsConfig.apiGateway.REGION,
    endpoint: awsConfig.apiGateway.URL
  }).signRequest({
    method: method,
    path: path,
    headers: headers,
    queryParams: queryParams,
    body: body
  });
  body = body ? JSON.stringify(body) : body;
  headers = signedRequest.headers;
  var results = await fetch(signedRequest.url, {
    method: method,
    headers: headers,
    body: body
  });
  if (results.status !== 200) {
    throw new Error((await results.text()));
  }
  return results.json();
};