const express = require('express');
const { Op } = require("sequelize");
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const UserModel = require('../../model/UserModel');
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
  const { credits, costPerClick, supplierId} = req.body;
  if (!credits) throw new Error("Missing credits fields");
  if (!costPerClick) throw new Error("Missing costPerClick fields");
  if (!supplierId) throw new Error("Missing supplierId fields");

  const client = await UserModel.findByPk(supplierId);

  if (!client) throw new Error("Supplier not found");

  await UserModel.update({ credits, costPerClick }, { where: {id: supplierId}});

  res.send({ sucess: "Supplier updated"});
}));

module.exports = router
