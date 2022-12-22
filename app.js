const body_parser = require('body-parser'); 
const compression = require('compression')
const cors = require('cors');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const sequelize = require('sequelize');

// Config
const DB_NAME = process.env.DB_NAME || 'default';
const DB_PASSWORD = process.env.DB_PASSWORD || 'flashcards';
const DB_USERNAME = process.env.DB_USERNAME || 'flashcards';
const DB = new sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
  dialect: 'sqlite',
  storage: 'cards.db'
});
const ORIGIN = process.env.ORIGIN || 'http://localhost';
const PORT = process.env.PORT || 8080;

const app = express();

app.set('view engine', 'pug');
app.use(body_parser.urlencoded({extended: false})); // Use querystring library not qs library
app.use(compression());
app.use(cors({origin: ORIGIN}));
app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 2, // 2 minutes
    sameSite: 'strict',
    secure: false // TODO set to true when using https
  },
  genid: function(request) {
    return crypto.randomUUID(); // Use UUIDs for session IDs
  },
  resave: false,
  rolling: true, // Restart maxAge count down from last response so user stays in if activity but is lock out if not
  saveUninitialized: false, 
  secret: crypto.randomUUID(),
}));
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

// Health check
app.get('/healthcheck', async (request, response) => {
  try {
    await DB.authenticate();
    response.sendStatus(200);
  } catch (error) {
    console.log({'timestamp': Date.now(), 'severity': 'ERROR', status: '', 'message': `${error.messagge} ${error.stack}`});
    resonse.sendStatus(500);
  }
});

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
  error.status = error.status || 500;
  response.status(error.status);
  console.log({'timestamp': Date.now(), 'severity': 'ERROR', 'status': response.statusCode, 'message': `${error.message} ${error.stack}`});
  response.render('error', {error: error});
});

const server = app.listen(PORT, async () => {
  console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': `App listening on port ${PORT}`});
  try {
    console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': `Starting...`});
    await DB.authenticate();
    await DB.sync();
  } catch (error) {
    console.log({'timestamp': Date.now(), 'severity': 'ERROR', status: '', 'message': `${error.messagge} ${error.stack}`});
  }
});

// Handle shutdown
async function shutdown () {
  console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': `Shutting down...`});
  try {
    server.close(async () => {
      console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': 'All requests stopped'});
      await DB.close();
      console.log({'timestamp': Date.now(), 'severity': 'INFO', 'status': '', 'message': 'DB disconnected'});
      process.exit(0);
    });
  } catch (error) {
    console.log({'timestamp': Date.now(), 'severity': 'ERROR', status: '', 'message': `${error.messagge} ${error.stack}`});
    setTimeout(() => {
      console.error({'timestamp': Date.now(), 'severity': 'ERROR', status: '', 'message': 'Could not close connections in time, forcefully shutting down'});
      process.exit(1);
    }, 10);
  }
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGQUIT', shutdown);
