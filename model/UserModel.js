const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');
const bcrypt = require('bcrypt');

const BackOfficeUser = sequelize.define('User', {
  email: {
    type: Sequelize.STRING,
    allowNull: true,
    unique: true
  },
  firstName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  lastName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  companyName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  companyVatNumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  address: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  oauth_uid: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  oauth_provider: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phonenumber: {
    type: Sequelize.STRING,
    allowNull: true,
  },
}, { timestamps: true });

BackOfficeUser.generateHash = function (password) {
  return bcrypt.hash(password, 9);
}

module.exports = BackOfficeUser