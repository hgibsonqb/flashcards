const express = require('express');
const sequelize = require('sequelize');

module.exports = (db) => {
  const router = express.Router();
  const Card = require('../models/card.js')(db);
  const User = require('../models/user.js')(db);

  router.use('/', async (request, response, next) => {
    const userid = request.session.userid;
    request.user = await User.findByPk(userid);
    next();
  });

  router.use('/:userid(\\d+)/', async (request, response, next) => {
    if (request.user.id) {
      if (request.user.id === parseInt(request.params.userid) ) {
        next();
      } else {
        const error = new Error('Not Authorized');
        error.status = 401;
        next(error);
      }
    } else {
      response.redirect(303, '/auth/hello');
    }
  });

  router.use('/:userid(\\d+)/:id(\\d+)/', async (request, response, next) => {
    const id = parseInt(request.params.id);
    request.card = await Card.findByPk(id);
    if (request.card) {
      if (request.card.UserId === request.user.id) {
        next();
      } else {
        const error = new Error('Not Authorized');
        error.status = 401;
        next(error);
      }
    } else {
      const error = new Error('Not Found');
      error.status = 404;
      next(error);
    }
  });
  
  router.get('/:userid(\\d+)/:id(\\d+)/delete', async (request, response) => {
    const template = {
      id: request.card.id,
      name: request.user.username,
      text: request.card.question,
      userid: request.user.id
    }
    response.render('delete', template); 
  });
  
  router.post('/:userid(\\d+)/:id(\\d+)/delete', async (request, response) => {
    await Card.destroy({
      where: {id: request.card.id}
    });
    response.redirect(303, `/cards/${request.user.id}/`); 
  });
  
  router.get('/:userid(\\d+)/:id(\\d+)/edit', async (request, response) => {
    const template = {
      answer: request.card.answer,
      hint: request.card.hint,
      id: request.card.id,
      name: request.user.username,
      question: request.card.question,
      userid: request.user.id
    };
    response.render('edit', template); 
  });
  
  router.get('/:userid(\\d+)/:id(\\d+)/', async (request, response) => {
    const { side } = request.query;
    if (!side) {
        return response.redirect(303, `/cards/${request.user.id}/${request.card.id}?side=question`);
    }
    const template = { id: request.card.id, name: request.user.username, side: side, userid: request.user.id};
    if ( side === 'question' ) {
      template.hint = request.card.hint;
      template.sideToShow = 'answer';
      template.sideToShowDisplay = 'Answer';
      template.text = request.card.question;
    } else if ( side === 'answer' ) {
      template.sideToShow = 'question';
      template.sideToShowDisplay = 'Question';
      template.text = request.card.answer;
    }
    response.render('card', template);
  });
  
  router.post('/:userid(\\d+)/:id(\\d+)/', async (request, response) => {
    await Card.update({
      answer: request.body.answer,
      hint: request.body.hint,
      question: request.body.question,
      UserId: request.user.id
    },{
      where: {id: request.card.id}
    });
    response.redirect(303, `/cards/${request.user.id}/${request.card.id}?side=question`); 
  });
  
  router.get('/:userid(\\d+)/new', async (request, response) => {
    const template = {
      answer: "",
      hint: "",
      name: request.user.username,
      question: "",
      userid: request.user.id
    };
    response.render('new', template); 
  });
  
  router.post('/:userid(\\d+)/', async (request, response) => {
    const card = await Card.create({
      answer: request.body.answer,
      hint: request.body.hint,
      question: request.body.question,
      UserId: request.user.id
    });
    response.redirect(303, `/cards/${request.user.id}/${card.id}?side=question`); 
  });
  
  router.get('/:userid(\\d+)?/', async ( request, response ) => {
    if (request.user) {
      const card = await Card.findAll({ 
        limit: 1,
        order: db.random(),
        where: { userid: request.user.id }
      });
      if (card.length > 0) {
        response.redirect(303, `/cards/${request.user.id}/${card[0].id}`);
      } else {
        response.render('index', {userid: request.user.id, name: request.user.username});
      }
    } else {
      response.redirect(303, '/auth/hello');
    } 
  });

  return router;
};
