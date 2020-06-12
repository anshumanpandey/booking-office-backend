const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  })
if (process.env.OFFLINE) {
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite'
    })
}
module.exports = sequelize