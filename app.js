const body_parser = require('body-parser'); 
const compression = require('compression')
const cookie_parser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const sequelize = require('sequelize');

// Config
const DB = new sequelize({
  dialect: 'sqlite',
  storage: 'cards.db'
});
const ORIGIN = 'http://localhost';
const PORT = 8080;

const app = express();

app.set('view engine', 'pug');
app.use(body_parser.urlencoded({extended: false})); // Use querystring library not qs library
app.use(compression());
app.use(cookie_parser());
app.use(cors({origin: ORIGIN}));
app.use('/static', express.static('public'));

// Logging middleware
app.use((request, response, next) => {
  console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': response.statusCode, 'message': `${request.method} ${request.url}`});
  next();
});

// Authentication routes
const auth = require('./routes/auth.js')(DB);
app.use('/auth', auth);

// Card routes
const cards = require('./routes/cards.js')(DB);
app.use('/cards', cards);

// Index
app.get('/', (request, response) => {
  response.redirect(303, '/cards/');
});

// 404 handler
app.use((request, response, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

// Error middleware
app.use((error, request, response, next) => {
  error.status = error.status ? error.status : 500;
  response.status(error.status);
  console.log({'timestamp': Date.now(), 'severity': 'ERROR', 'status': response.statusCode, 'message': `${error.message} ${error.stack}`});
  response.render('error', {error: error});
});

app.listen(PORT, async () => {
  console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': `App listening on port ${PORT}`});
  try {
    await DB.authenticate();
    await DB.sync();
  } catch (error) {
    console.log({'timestamp': Date.now(), 'severity': 'ERROR', status: '', 'message': `${error.messagge} ${error.stack}`});
  }
});
