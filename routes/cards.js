const express = require('express');
const sequelize = require('sequelize');

module.exports = (db) => {
  const router = express.Router();
  const Card = require('../models/card.js')(db);
  const User = require('../models/user.js')(db);

  router.get('/', async ( request, response ) => {
    const userid = request.cookies.userid;
    if (userid) {
      const card = await Card.findAll({ 
        limit: 1,
        order: db.random(),
        where: { userid: userid }
      });
      if (card.length > 0) {
        response.redirect(303, `/cards/${userid}/${card[0].id}`);
      } else {
        response.render('app');
      }
    } else {
      response.redirect(303, '/auth/hello');
    } 
  });

  router.get('/:userid(\\d+)/:id(\\d+)/', async (request, response) => {
    const { side } = request.query;
    const id  = request.params.id;
    const userid = request.cookies.userid;
    
    if ( userid === request.params.userid ) {
      const user = await User.findByPk(userid);
      if (!side) {
        return response.redirect(303, `/cards/${userid}/${id}?side=question`);
      }
      const card = await Card.findByPk(id);
      const template = { id: card.id, name: user.username, side: side};
      if ( side === 'question' ) {
        template.hint = card.hint;
        template.sideToShow = 'answer';
        template.sideToShowDisplay = 'Answer';
        template.text = card.question;
      } else if ( side === 'answer' ) {
        template.sideToShow = 'question';
        template.sideToShowDisplay = 'Question';
        template.text = card.answer;
      }
      response.render('card', template);
    } else {
      response.redirect(303, '/auth/hello');
    }
  });

  return router;
};
