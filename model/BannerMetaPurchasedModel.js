const Sequelize = require('sequelize');
const sequelize = require('../utils/Database');

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

UserModel.hasMany(BannerPurchasedModel, {
  foreignKey: {
    allowNull: false
  }
});

PaymentModel.belongsTo(BannerPurchasedModel);

module.exports = BannerPurchasedModel