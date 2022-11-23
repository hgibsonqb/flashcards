const sequelize = require('sequelize');

module.exports = (db) => {
  class Card extends sequelize.Model {};
  Card.init({
    answer: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "answer is required" }
        notNull: { msg: "answer is required" }
      }
    },
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: sequelize.INTEGER
    },
    question: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "question is required" }
        notNull: { msg: "question is required" }
      }
    }
  }, { sequelize: db });
  return Card;
};
