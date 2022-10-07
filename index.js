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
  const show_answer = request.query.show_answer;
  response.render('card', {question: 'Hello', answer: 'World!', number: number, show_answer: show_answer});
});

app.post('/card/:number(\\d+)/', (request, response) => {
  const number = parseInt(request.params.number);
  const action = request.body['action'];
  if (action === 'show_answer') {
    response.redirect(303, `/card/${number}?show_answer=true`);
  } else if (action === 'show_next') {
    response.redirect(303, `/card/${number + 1}`);
  }
});

app.listen(PORT);
