const Sequelize = require('sequelize');
const UserModel = require('./UserModel');
const sequelize = require('../utils/Database');

const BannerModel = sequelize.define('Banner', {
  // attributes
  country: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  paymentFrequency: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
}, { timestamps: true });

module.exports = BannerModel