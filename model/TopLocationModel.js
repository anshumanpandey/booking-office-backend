const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../utils/Database');
const UserModel = require('./UserModel');

const TopLocation = sequelize.define('TopLocation', {
  // attributes
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  imagePath: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, { timestamps: false });


module.exports = TopLocation