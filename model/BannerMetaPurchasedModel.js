const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');
const UserModel = require('./UserModel');
const BannerMetaModel = require('./BannerMetaModel');

const BannerPurchasedModel = sequelize.define('BannerPurchased', {
  // attributes
  availableFromDate: {
    type: Sequelize.DATE,
    allowNull: true,
    require: false,
  },
  availableToDate: {
    type: Sequelize.DATE,
    allowNull: true,
    require: false,
  },
}, { timestamps: true });

BannerMetaModel.hasMany(BannerPurchasedModel, {
  foreignKey: {
    allowNull: false
  }
});
BannerPurchasedModel.belongsTo(BannerMetaModel)


UserModel.hasMany(BannerPurchasedModel, {
  foreignKey: {
    allowNull: false
  }
});
BannerPurchasedModel.belongsTo(UserModel)

module.exports = BannerPurchasedModel