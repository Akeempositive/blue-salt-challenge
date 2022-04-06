
const express = require('express')
const https = require('http');
const app = express()
const port = 3000

app.use(express.json());

app.post('/fund-account', (req, res) => {
  console.log('Request-received')
  console.log(req.body)
  var transaction = req.body
  postRequestToBillService(transaction)
  res.send({success: true, result: 'Account is beiing funded'})
})
var postRequestToBillService = (transaction) => {
  var postData = JSON.stringify(transaction)
  var options = {
    hostname: 'localhost',
    port: 3001,
    path: '/transaction',
    method: 'POST',
    headers: {
         'Content-Type': 'application/json',
         'Content-Length': postData.length
       }
  };
  var req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);
  
    res.on('data', (d) => {
      process.stdout.write(d);
    });
  });
  req.on('error', (e) => {
    console.error(e);
  });
  req.write(postData);
  req.end();
}
app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`)
})