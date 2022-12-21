const bcrypt = require('bcrypt');
const express = require('express');

const SALT_ROUNDS = 10;
const router = express.Router();

module.exports = (db) => {
  const User = require('../models/user.js')(db);

  router.get('/hello', (request, response) => {
    // Show login page
    response.render('hello');
  });

  router.post('/hello', async (request, response) => {
    const username = request.body.username;
    const password = request.body.password;
    const user = await User.findOne({
      where: { username: username }
    });
    if ( user === null ) {
      // Sign up
      await bcrypt.genSalt(SALT_ROUNDS, async (error, salt) => {
        if (error) {
          throw error; 
        }
        await bcrypt.hash(password, salt, async (error, hash) => {
          if (error) {
            throw error; 
          }
          const user = await User.create({username: username, password: hash});
          request.session.userid = user.id;
          request.session.username = user.username;
          response.redirect(302, '/cards');
        });
      });
    } else {
      // Login
      bcrypt.compare(password, user.password, (error, result) => {
        if (result) {
          request.session.userid = user.id;
          request.session.username = user.username;
          response.redirect(302, '/cards');
        } else {
          console.log("Password is incorrect"); 
          response.redirect(303, '/auth/hello');
        }
      });
    }
  });

  router.post('/goodbye', (request, response) => {
    // Log out
    request.session.destroy();
    response.redirect(303, '/auth/hello');
  });

  return router;
};
