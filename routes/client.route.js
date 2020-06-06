const express = require('express');
const router = express.Router();
const Op = require('sequelize').Op;
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../utils/Config');
const sequelize = require('../utils/Database');
const UserModel = require('../model/UserModel');


router.post('/login', AsyncMiddleware(async (req, res) => {

  const BOUser = await UserModel.findOne({
    where: { email: req.body.clientname },
  });
  if (!BOUser) throw new Error('Username or password incorrect')
  if (BOUser.client && BOUser.client.disabled === true) throw new Error('Account disabled!')

  const itPassed = await bcrypt.compare(req.body.password, BOUser.password)
  if (!itPassed) throw new Error('Username or password incorrect');

  const c = BOUser.toJSON();
  delete c.password

  const token = jwt.sign(c, config.JWT_SECRET, { expiresIn: '12h' });
  res.send({ token, ...c });
}));

router.get('/client', AsyncMiddleware(async (req, res) => {
  const client = await UserModel.findOne({
    where: { 'id': req.user.id },
    include: { all: true }
  });

  if (!client) throw new Error('Username or password incorrect')

  const c = client.toJSON();
  delete c.password
  res.send(c);
}));

router.get('/profile', AsyncMiddleware(async (req, res) => {
  const user = await BackOfficeUsersModel.findOne({
    where: { 'id': req.user.id },
    include: { all: true }
  });

  if (!user) throw new Error('Username or password incorrect')

  const c = user.toJSON();
  delete c.password
  c.roleGuards = c.roleGuards.map(r => r.role)

  res.send({ ...c, ...c.client});
}));

router.post('/register', AsyncMiddleware(async (req, res) => {
  if (!req.body.email) throw new Error('Missing email param');
  if (!req.body.password) throw new Error('Missing password param');
  if (!req.body.confirm) throw new Error('Missing confirm password param');
  
  if (req.body.password !== req.body.confirm) throw new Error('Password and confirm password does not match');

  const justCreatedClient = await sequelize.transaction(async (t) => {
    let client = await UserModel.findOne({ where: { 'email': req.body.email } }, { transaction: t });
    if (client) throw new Error('User already register');

    // TODO: handle new roles on user creation
    return client = await UserModel.create({
      password: await UserModel.generateHash(req.body.password),
      type: "company",
      email: req.body.email,
    }, { transaction: t })


  })

  const token = jwt.sign(justCreatedClient.toJSON(), config.JWT_SECRET, { expiresIn: '12h' });

  const c = justCreatedClient.toJSON();
  delete c.password
  res.send({ token, ...c });
}));

router.put('/edit', AsyncMiddleware(async (req, res) => {
  const { costPerClick, supplierId, password, confirmPassword} = req.body;

  const client = await UserModel.findByPk(supplierId);

  if (!client) throw new Error("Supplier not found");

  const extra = {}
  if (password !== confirmPassword) throw new Error("Password not match");
  if (password) {
    extra.password = await UserModel.generateHash(password)
  }

  delete req.body.balance
  delete req.body.credits
  delete req.body.id
  delete req.body.costPerClick
  delete req.body.type

  await UserModel.update({ ...req.body, ...extra }, { where: {id: supplierId}});

  res.send(await UserModel.findByPk(supplierId));
}));


module.exports = router;