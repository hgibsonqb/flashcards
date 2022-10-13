const express = require('express');
const cookie_parser = require('cookie-parser');
const body_parser = require('body-parser');

const PORT = 8080;
const app = express();

app.set('view engine', 'pug');
app.use(body_parser.urlencoded({extended: false})); // Use querystring library not qs library
app.use(cookie_parser());
// Logging middleware
app.use((request, response, next) => {
  console.log({'timestamp': Date.now(), 'message': `${request.method} ${request.url} ${response.statusCode}`});
  next();
});
// Error middleware
app.use((error, request, response, next) => {
  console.log({'timestamp': Date.now(), 'message': `${error.message} ${error.stack}`});
  const status = 500;
  error.status = status;
  response.status(status);
  response.render('error', error);
});

app.get('/', (request, response) => {
  const card_number = request.cookies.card_number ? request.cookies.card_number : 0;
  response.redirect(303, `/card/${card_number}`);
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
    response.cookie('card_number', number + 1);
    response.redirect(303, `/card/${number + 1}`);
  } else if (action === 'reset') {
    response.clearCookie('card_number');
    response.redirect(303, '/card/0');
  }
});

app.listen(PORT, () => {
  console.log({'timestamp': Date.now(), 'message': `App listening on port ${PORT}`});
});
