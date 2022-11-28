const sequelize = require('sequelize');

const db = new sequelize({
  dialect: 'sqlite',
  storage: 'cards.db'
});
const Card = require('./models/cards.js')(db)
const { cards } = require('./cards.json');
try {
  for (let i = 0; i < cards.length; i++) {
    const card = await Card.create({ answer: cards[i].answer, question: cards[i].question});
  }
} catch (error) {
  console.error('Error connecting to the database: ', error);
}
