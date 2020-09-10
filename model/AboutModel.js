const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');

const TopLocation = sequelize.define('About', {
  // attributes
  body: {
    type: Sequelize.STRING(3000),
    allowNull: false,
  },
}, { timestamps: false });

TopLocation.sync()


module.exports = TopLocation