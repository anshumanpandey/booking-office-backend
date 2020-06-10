const Sequelize = require('sequelize');
const UserModel = require('./UserModel');
const sequelize = require('../utils/Database');

const PaymentModel = sequelize.define('Payment', {
  // attributes
  orderId: {
    type: Sequelize.STRING,
    allowNull: false,
    require: true,
  },
  amount: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  buyedItem: {
    type: Sequelize.STRING,
    allowNull: true,
  },
}, { timestamps: true });

UserModel.hasMany(PaymentModel, {
  foreignKey: {
    allowNull: false
  }
});

PaymentModel.belongsTo(UserModel);

module.exports = PaymentModel