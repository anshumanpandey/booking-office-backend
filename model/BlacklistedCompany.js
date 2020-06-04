const Sequelize = require('sequelize');
const UserModel = require('./UserModel');
const sequelize = require('../utils/Database');

const BlacklistedCompany = sequelize.define('BlacklistedCompany', {
  // attributes
  companyName: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
}, { timestamps: true });

module.exports = BlacklistedCompany