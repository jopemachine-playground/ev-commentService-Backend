import express = require('express');
var app = express();

app.get('/', function (req : express.Request, res: express.Response) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});