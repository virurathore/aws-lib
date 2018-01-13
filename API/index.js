export default async function invokeApig({
  awsConfig,
  path,
  method = "GET",
  headers = {},
  queryParams = {},
  body
}) {
  if (!await authUser()) {
    throw new Error("User is not logged in");
  }
  const signedRequest = sigV4Client
    .newClient({
      accessKey: AWS.config.credentials.accessKeyId,
      secretKey: AWS.config.credentials.secretAccessKey,
      sessionToken: AWS.config.credentials.sessionToken,
      region: awsConfig.apiGateway.REGION,
      endpoint: awsConfig.apiGateway.URL
    })
    .signRequest({
      method,
      path,
      headers,
      queryParams,
      body
    });
  body = body ? JSON.stringify(body) : body;
  headers = signedRequest.headers;
  const results = await fetch(signedRequest.url, {
    method,
    headers,
    body
  });
  if (results.status !== 200) {
    throw new Error(await results.text());
  }
  return results.json();
}
