// Adapted from the example at https://www.npmjs.com/package/aws4
import aws4 from "aws4";
import tls from "tls";

// Don't put credentials in your code!
import 'dotenv/config'

// Command line arguments
const args = process.argv.slice(2);

if (args.length != 2) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} bucketName objectKey`);
  process.exit(1);
}

const BUCKET = args[0];
const KEY = args[1];
const ENDPOINT_URL = process.env.AWS_ENDPOINT_URL || `https://s3.${process.env.AWS_REGION}.amazonaws.com`;

const endpoint = new URL(ENDPOINT_URL).hostname;
const host = `${BUCKET}.${endpoint}`
const body =  'Hello from Node!';

// aws4 will sign an options object as you'd pass to http.request, with an AWS service and region
var opts = {
  host: host,
  path: `/${KEY}`,
  service: 's3',
  region: process.env.AWS_REGION,
  method: 'PUT',
  body: body,
  'content-length': body.length,
  'content-type': 'text/plain',
}

// aws4 will get credentials from process.env.AWS_ACCESS_KEY_ID, etc
aws4.sign(opts)

// console.log("opts: ", opts)

// You can override host, path etc at this point for testing
// Note that httpbin will return "400 Bad Request" for an illegal
// HTTP request, e.g. both Content-length and Transfer-encoding
// headers are included.

// opts.host = 'httpbin.org';
// opts.headers.Host = 'httpbin.org';
// opts.path = '/anything';
// opts.method = 'POST'; // httpbin doesn't support PUT :-(

// Transfer-encoding: chunked

// Construct HTTP request from scratch so we can control the headers
// This is an illegal request with both Content-length and Transfer-encoding
const payload = `${opts.method} ${opts.path} HTTP/1.1
Host: ${opts.host}
Content-type: ${opts.headers['Content-Type']}
Content-length: ${opts.headers['Content-Length']}
x-amz-content-sha256: ${opts.headers['X-Amz-Content-Sha256']}
x-amz-date: ${opts.headers['X-Amz-Date']}
authorization: ${opts.headers['Authorization']}

${opts.body}`;

const tlsOpts = {
  checkServerIdentity: () => {
    return null;
  },
};

const client = tls.connect(443, opts.host, tlsOpts, () => {
  console.log('client connected: ',
      client.authorized ? 'authorized' : 'unauthorized', '\n');

  console.log(`Outgoing message:\n\n-----\n${payload}\n-----\n`);
  client.write(payload);
});

// Display incoming data
client.on('data', (data) => {
  console.log(`Incoming message:\n\n-----\n${data.toString()}\n-----\n`);
  client.end();
});

client.on('end', () => {
  console.log('disconnected from server');
});
