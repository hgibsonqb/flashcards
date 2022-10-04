const express = require('express');

const PORT = 8080;
const app = express();

app.set('view engine', 'pug');

app.get('/', (request, response) => {
  response.render('index');
});

app.listen(PORT);
