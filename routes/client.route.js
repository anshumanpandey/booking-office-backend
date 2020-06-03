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

router.post('/facebook', AsyncMiddleware(async (req, res) => {
  const { id, name, } = req.body;
  if (!id) {
    res.send({ response: 'No Instagram code!' });
    return;
  }
  let client = await BackOfficeUsersModel.findOne({ where: { 'oauth_uid': req.body.id } });

  if (!client) {
    client = await BackOfficeUsersModel.create({
      clientname: name,
      oauth_uid: id,
      oauth_provider: 'facebook',
    });
  }

  const token = jwt.sign(client.toJSON(), config.JWT_SECRET, { expiresIn: '12h' });
  const r = {
    token: token,
    ...client.toJSON()
  }
  res.send(r);
}));

router.get('/instagram/', AsyncMiddleware(async (req, res) => {
  const redirect_uri = 'https' + '://' + req.get('host') + '/instagram'
  console.log(redirect_uri);
  if (!req.query.code) {
    res.send({ response: 'No Instagram code!' });
  }
  axios({
    method: "POST",
    url: `https://api.instagram.com/oauth/access_token`,
    data: querystring.stringify({
      'client_id': '1133493423650865',
      'client_secret': 'dd1657b0a5c5485b93fe6d1cd97be8e4',
      'grant_type': 'authorization_code',
      'redirect_uri': redirect_uri,
      'code': req.query.code
    })
  })
    .then(r => {
      const { user_id, access_token } = r.data;
      return axios({ url: `https://graph.instagram.com/${user_id}?fields=id,username&access_token=${access_token}` })
    })
    .then(async r => {
      const { id, username } = r.data;
      let client = await BackOfficeUsersModel.findOne({ where: { 'oauth_uid': id } });

      if (!client) {
        client = await BackOfficeUsersModel.create({
          clientname: username,
          oauth_uid: id,
          oauth_provider: 'instagram',
        });
      }

      const token = jwt.sign(client.toJSON(), config.JWT_SECRET, { expiresIn: '12h' });
      const auth = {
        token: token,
        ...client.toJSON()
      }

      res.send(`
      <script>
        window.opener.postMessage(${JSON.stringify(auth)}, '*')
        window.close();
      </script>
    `);

    })
    .catch(error => {
      if (error.response) {
        console.log(error.response.data);
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        res.send(error.response.data);
        console.log(error.response.status);
      } else {
        res.send({ error: error.toString() });
      }
    });
}));

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


module.exports = router;