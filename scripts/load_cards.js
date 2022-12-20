const bcrypt = require('bcrypt');
const sequelize = require('sequelize');

const DB = new sequelize({
  dialect: 'sqlite',
  storage: 'cards.db'
});
const SALT_ROUNDS = 10;
const Card = require('../models/card.js')(DB);
const User = require('../models/user.js')(DB);
const { cards } = require('./cards.json');
async function load_cards() {
  try {
    await DB.authenticate();
    await DB.sync({force: true});
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash('test', salt);
    const user = await User.create({username: 'test', password: hash});
    for (let i = 0; i < cards.length; i++) {
      const card = await Card.create({ answer: cards[i].answer, hint: cards[i].hint, question: cards[i].question, UserId: cards[i].userid});
    }
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
}
load_cards();
