const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('../utils/Database');
const UserModel = require('./UserModel');

const ClickTrack = sequelize.define('ClickTrack', {
  // attributes
  ip: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  created_at: {
    type: Sequelize.STRING,
    defaultValue: function() {
        return moment().format("YYYY-MM-DD HH:mm:ss")
    },
    allowNull: false
  },
}, { timestamps: false });

UserModel.hasMany(ClickTrack, {
  foreignKey: {
    allowNull: false
  }
});

ClickTrack.belongsTo(UserModel);

module.exports = ClickTrack