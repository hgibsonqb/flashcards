const sequelize = require('sequelize');

module.exports = (db) => {
  const User = require('./user.js')(db);
  class Card extends sequelize.Model {};
  Card.init({
    answer: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "answer is required" },
        notNull: { msg: "answer is required" }
      }
    },
    hint: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "hint is required" },
        notNull: { msg: "hint is required" }
      }
    },
    question: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "question is required" },
        notNull: { msg: "question is required" }
      }
    }
  }, { sequelize: db });
  User.hasMany(Card);
  Card.belongsTo(User);
  return Card;
};
