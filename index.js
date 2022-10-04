const express = require('express');
const body_parser = require('body-parser');

const PORT = 8080;
const app = express();

app.set('view engine', 'pug');
app.use(body_parser.urlencoded({extended: false})); // Use querystring library not qs library

app.get('/', (request, response) => {
  response.redirect(303, '/card/0');
});

app.get('/card/:number(\\d+)/', (request, response) => {
  const number = parseInt(request.params.number);
  response.render('card', {question: 'Hello', answer: 'World!', number: number, show_answer: true});
});

app.listen(PORT);
