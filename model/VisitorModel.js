const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');
const bcrypt = require('bcrypt');

const BackOfficeUser = sequelize.define('Visitor', {
  ip: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: true,
  },

  pickupLocation: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  pickupDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  pickupTime: {
    type: Sequelize.TIME,
    allowNull: true,
  },
  
  dropoffLocation: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  dropoffDate: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  dropoffTime: {
    type: Sequelize.TIME,
    allowNull: true,
  },

}, { timestamps: true });


module.exports = BackOfficeUser