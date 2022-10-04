const express = require('express');

const PORT = 8080;
const app = express();

app.get('/', (request, response) => {
  const body = 'Hello World!';
  response.writeHead(200, {'Content-Type': 'text/plain', 'Content-Length': Buffer.byteLength(body)});
  response.end(body);
});

app.listen(PORT);
