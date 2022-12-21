const express = require('express');
const sequelize = require('sequelize');

module.exports = (db) => {
  const router = express.Router();
  const Card = require('../models/card.js')(db);
  const User = require('../models/user.js')(db);

  router.use('/:userid(\\d+)?/', async (request, response, next) => {
    const userid = parseInt(request.params.userid);
    if (request.session.userid) {
      if (request.session.userid === userid || !userid ) {
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
    if (!request.session.card || parseInt(request.session.card.id) !== id) {
      request.session.card = await Card.findByPk(id);
    }
    if (request.session.card) {
      if (request.session.card.UserId === request.session.userid) {
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
      id: request.session.card.id,
      name: request.session.username,
      text: request.session.card.question,
      userid: request.session.userid
    }
    response.render('delete', template); 
  });
  
  router.post('/:userid(\\d+)/:id(\\d+)/delete', async (request, response) => {
    await Card.destroy({
      where: {id: request.session.card.id}
    });
    response.redirect(303, `/cards/${request.session.userid}/`); 
  });
  
  router.get('/:userid(\\d+)/:id(\\d+)/edit', async (request, response) => {
    const template = {
      answer: request.session.card.answer,
      hint: request.session.card.hint,
      id: request.session.card.id,
      name: request.session.username,
      question: request.session.card.question,
      userid: request.session.userid
    };
    response.render('edit', template); 
  });
  
  router.get('/:userid(\\d+)/:id(\\d+)/', async (request, response) => {
    const { side } = request.query;
    if (!side) {
        return response.redirect(303, `/cards/${request.session.userid}/${request.session.card.id}?side=question`);
    }
    const template = { id: request.session.card.id, name: request.session.username, side: side, userid: request.session.userid};
    if ( side === 'question' ) {
      template.hint = request.session.card.hint;
      template.sideToShow = 'answer';
      template.sideToShowDisplay = 'Answer';
      template.text = request.session.card.question;
    } else if ( side === 'answer' ) {
      template.sideToShow = 'question';
      template.sideToShowDisplay = 'Question';
      template.text = request.session.card.answer;
    }
    response.render('card', template);
  });
  
  router.post('/:userid(\\d+)/:id(\\d+)/', async (request, response) => {
    await Card.update({
      answer: request.body.answer,
      hint: request.body.hint,
      question: request.body.question,
      UserId: request.session.userid
    },{
      where: {id: request.session.card.id}
    });
    response.redirect(303, `/cards/${request.session.userid}/${request.session.card.id}?side=question`); 
  });
  
  router.get('/:userid(\\d+)/new', async (request, response) => {
    const template = {
      answer: "",
      hint: "",
      name: request.session.username,
      question: "",
      userid: request.session.userid
    };
    response.render('new', template); 
  });
  
  router.post('/:userid(\\d+)/', async (request, response) => {
    const card = await Card.create({
      answer: request.body.answer,
      hint: request.body.hint,
      question: request.body.question,
      UserId: request.session.userid
    });
    response.redirect(303, `/cards/${request.session.userid}/${card.id}?side=question`); 
  });
  
  router.get('/:userid(\\d+)?/', async ( request, response ) => {
    if (request.session.userid) {
      const card = await Card.findAll({ 
        limit: 1,
        order: db.random(),
        where: { userid: request.session.userid }
      });
      if (card.length > 0) {
        response.redirect(303, `/cards/${request.session.userid}/${card[0].id}`);
      } else {
        response.render('index', {userid: request.session.userid, name: request.session.username});
      }
    } 
  });

  return router;
};
