const sequelize = require('sequelize');

module.exports = (db) => {
  class User extends sequelize.Model {};
  User.init({
    password: {
      allowNull: false,
      type: sequelize.STRING,
      validate: {
        notEmpty: { msg: "password is required" },
        notNull: { msg: "password is required" }
      }
    },
    username: {
      allowNull: false,
      type: sequelize.STRING,
      unique: true,
      validate: {
        notEmpty: { msg: "username is required" },
        notNull: { msg: "username is required" }
      }
    },
  }, { sequelize: db });
  return User;
};
