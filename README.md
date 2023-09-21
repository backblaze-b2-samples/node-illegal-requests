# Make Illegal AWS SigV4 Signed Requests


It's useful in testing to be able to generate and submit AWS SigV4 signed requests that violate the HTTP standard; for example, a PUT request with both a `Content-Length` header and the `Transfer-Encoding` header set to `chunked`. Most HTTP libraries enforce the HTTP standard, so it can be difficult to test certain conditions. This Node.js app applies an AWS SigV4 signature to an HTTP request and submits it directly to a TLS socket, so it is possible to manipulate the headers and body in any way you see fit.

The app assumes you are accessing S3-compatible cloud object storage, but it can easily be adapted to any other AWS-style service.

## Prerequisites

* Node.js - I used v20.5.1 but any recent version should work
* An account with an S3-compatible cloud storage 

## Install Dependencies

```shell
npm install
```

## Edit Configuration File

* Copy `.env.template` to `.env`
* Add your credentials to `.env`:
  ```
  AWS_ACCESS_KEY_ID='your-application-key-id'
  AWS_SECRET_ACCESS_KEY='your-application-key'
  AWS_REGION='your-b2-region'
  AWS_ENDPOINT_URL='https://your-b2-endpoint'
  ```
* You can have the app ignore TLS certificate errors - e.g. non-matching hostname - by uncommenting the line that sets the `NODE_TLS_REJECT_UNAUTHORIZED` environment variable:
  ```shell
  # Insecure TLS - useful for testing!
  # NODE_TLS_REJECT_UNAUTHORIZED=0
  ```

## Run the app

You must supply a bucket and object key on the command line.

```shell
npm start -- <bucketname> <objectkey>
```

The app displays the outgoing request and the incoming response:

```commandline
% npm start -- metadaddy-private tester

> illegal-s3-requests@1.0.0 start
> node index.js metadaddy-private tester

client connected:  authorized 

Outgoing message:

-----
PUT /tester HTTP/1.1
Host: metadaddy-private.s3.us-west-004.backblazeb2.com
Content-type: application/x-www-form-urlencoded; charset=utf-8
Content-length: 16
Transfer-encoding: chunked
x-amz-content-sha256: d132105e91eeb6179a2a546d0f75173b99355c4795880565e8ac450f20aec8b8
x-amz-date: 20230921T162801Z
authorization: AWS4-HMAC-SHA256 Credential=00415f935cf4dcb0000000046/20230921/us-west-004/s3/aws4_request, SignedHeaders=content-length;content-type;host;x-amz-content-sha256;x-amz-date, Signature=835282a8bf6fcfc45c8902c61ff028a17b59b1890517e3554e5dd6bc8e8d5942

Hello from Node!
-----

Incoming message:

-----
HTTP/1.1 400 
x-amz-request-id: 4e3677408f2c087f
x-amz-id-2: aMaU1cWbnORgz8TW3Y2Zm1zQVZIZj3GJ2
Cache-Control: max-age=0, no-cache, no-store
Content-Type: application/xml
Content-Length: 166
Date: Thu, 21 Sep 2023 16:28:01 GMT
Connection: close

<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Error>
    <Code>InvalidRequest</Code>
    <Message>Chunked transfer encoding is not supported</Message>
</Error>

-----

disconnected from server
```
