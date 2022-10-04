const express = require('express');

const PORT = 8080;
const app = express();

app.set('view engine', 'pug');

app.get('/', (request, response) => {
  response.redirect(303, '/card/0');
});

app.get('/card/:number', (request, response) => {
  response.render('card', {question: 'Hello', answer: 'World!', number: request.params.number, show_answer: true});
});

app.listen(PORT);
