const https = require('https');

const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ1bmlvbklkIjoiYWRtaW4tMDAxIiwiY2xpZW50SWQiOiJjcmYtbG9jYWwtYXBwIiwiaWF0IjoxNzc4OTE4NTE3LCJleHAiOjE4MTA0NzYxMTd9.d7M9k4dJSITDhbLohn6sdodQiskUXNBuDgawz9Wqtr8';

// 只传必填字段
const postData = JSON.stringify({
  json: {
    subjectUniqueId: 'TEST-005'
  }
});

const options = {
  hostname: 'zhongyibianzhengdafen.fun',
  path: '/CRF/api/trpc/crf.subject.create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log(data));
});

req.write(postData);
req.end();
