const Sequelize = require('sequelize');

let sequelize = new Sequelize('bookingc_db', 'bookingc_back', '-cdra#1~xazK', {
    host: '151.236.35.187',
    dialect: 'mysql'
  })
if (process.env.OFFLINE) {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite'
    })
}
module.exports = sequelize