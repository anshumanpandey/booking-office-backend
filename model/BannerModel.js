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
  amount: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  paymentFrequency: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  paypalId: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
}, { timestamps: true });

UserModel.hasMany(BannerModel, {
  foreignKey: {
    allowNull: false
  }
});

BannerModel.belongsTo(UserModel);

module.exports = BannerModel