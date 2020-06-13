const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');

const BannerModel = sequelize.define('BannerMeta', {
  // attributes
  locationName: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  locationCode: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  availableAmount: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  price: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
}, { timestamps: true });


module.exports = BannerModel