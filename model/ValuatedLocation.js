const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');

const ValuatedLocation = sequelize.define('ValuatedLocation', {
  // attributes
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  grcgdsClientId: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  value: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, { timestamps: true });


module.exports = ValuatedLocation