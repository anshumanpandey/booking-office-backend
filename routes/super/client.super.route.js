const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const Database = require('../../utils/Database');
const { Op } = require("sequelize");
const UserModel = require('../../model/UserModel');
const Decimal = require('decimal.js');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });

router.get('/super/client', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
  const clients = await UserModel.findAll({ where: { [Op.or]: [{ type: 'supplier' }, { type: 'broker' }] }, include: { all: true } });

  res.send(clients.map(client => {
    const c = client.toJSON();
    delete c.password
    return c;
  }));
}));

router.post('/super/client', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
  const {
    email,
    password,
    confirmPassword,
    costPerClick,
    type
  } = req.body;

  if (!email) throw new Error("Missing email fields");
  if (!password) throw new Error("Missing password fields");
  if (!confirmPassword) throw new Error("Missing confirmPassword fields");
  if (!type) throw new Error("Missing type fields");
  if (!costPerClick) throw new Error("Missing costPerClick fields");

  const client = await UserModel.findOne({ where: { email }});

  if (client) throw new Error("Email already register");
  if (password !== confirmPassword) throw new Error("Password not match");
  if (!(new RegExp('(supplier|broker)')).test(type)) throw new Error("invalid type");

  await UserModel.create({ email, password: await UserModel.generateHash(password), type, costPerClick});

  res.send({ sucess: "Supplier created"});
}));

router.put('/super/edit', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
  const { email, costPerClick, currencySymbol, supplierId} = req.body;
  if (!supplierId) throw new Error("Missing supplierId fields");
  if (!email) throw new Error("Missing supplierId fields");
  if (!costPerClick) throw new Error("Missing costPerClick fields");
  if (!currencySymbol) throw new Error("Missing currencySymbol fields");

  const client = await UserModel.findByPk(supplierId);

  if (!client) throw new Error("Supplier not found");

  const newCost = new Decimal(costPerClick)
  const balance = new Decimal(client.balance)

  let newBalance = null

  if (newCost.greaterThan(client.costPerClick) || newCost.lessThan(client.costPerClick)) {
    const clientBalance = new Decimal(client.balance);
    newBalance = clientBalance.dividedToIntegerBy(newCost) 
  }

  await UserModel.update({ costPerClick, email, currencySymbol, balance: newBalance.toNumber() }, { where: {id: supplierId}});

  res.send({ sucess: "Supplier updated"});
}));

module.exports = router
