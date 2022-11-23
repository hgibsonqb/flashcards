const sequelize = require('sequelize');

module.exports = (db) => {
  class Card extends sequelize.Model {};
  Card.init({
    answer: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notNull: { msg: "question is required" }
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
        notNull: { msg: "question is required" }
      }
    }
  }, { sequelize: db });
  return Card;
};
