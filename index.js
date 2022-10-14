const express = require('express');
const cookie_parser = require('cookie-parser');
const body_parser = require('body-parser');

const PORT = 8080;
const { cards } = require('./cards.json');
const app = express();

app.set('view engine', 'pug');
app.use(body_parser.urlencoded({extended: false})); // Use querystring library not qs library
app.use(cookie_parser());
app.use('/static', express.static('public'));
// Logging middleware
app.use((request, response, next) => {
  console.log({'timestamp': Date.now(), 'message': `${request.method} ${request.url} ${response.statusCode}`});
  next();
});

app.get('/', (request, response) => {
  const card_number = request.cookies.card_number ? request.cookies.card_number : 0;
  response.redirect(303, `/card/${card_number}`);
});

app.get('/card/:number(\\d+)/', (request, response) => {
  const number = parseInt(request.params.number);
  const show_answer = request.query.show_answer && request.query.show_answer.toLowerCase() === 'true';
  if ( number >= 0 && number < cards.length ) {
    const next = Math.floor(Math.random() * cards.length);
    response.cookie('card_number', number);
    response.render('card', {answer: cards[number].answer, length: cards.length, next: next, number: number, question: cards[number].question, show_answer: show_answer});
  } else {
    response.clearCookie('card_number');
    response.redirect(303, `/card/0`);
  }
});

// 404 handler
app.use((request, response, next) => {
  const status = 404;
  const error = new Error('Not Found');
  error.status = status;
  next(error);
});

// Error middleware
app.use((error, request, response, next) => {
  console.log({'timestamp': Date.now(), 'message': `${error.message} ${error.stack}`});
  error.status = error.status ? error.status : 500;
  response.status(error.status);
  response.render('error', {error: error});
});

app.listen(PORT, () => {
  console.log({'timestamp': Date.now(), 'message': `App listening on port ${PORT}`});
  console.log({'timestamp': Date.now(), 'message': `${cards.length} cards loaded`});
});
