require('dotenv').config()
const express = require('express');
const app = express();
const jwt = require('express-jwt');
const bodyParser = require('body-parser');
const Offerings = require('./utils/Offerings');
const Encryption = require('./utils/Encryption');
const cors = require('cors')
const path = require('path');
const db = require('./utils/Database');
const config = require('./utils/Config');
const routes = require('./routes/index');
const fileUpload = require('express-fileupload');

app.use(function(req, res, next) {
  if (RegExp(`^/api`).test(req.originalUrl) && !RegExp(`^/api/public`).test(req.originalUrl)) {
    var send = res.send;
    res.send = function(obj) {
      send.call(this, Encryption.encrypt(obj));
    };
  }
  
  next();
});
app.use(cors())
app.use(fileUpload());
const routesToByPass = [
  '/api/facebook', '/api/instagram', '/api/login',
  /static/, '/api/', '/api/register', '/api/test',
  '/api/search', '/api/getiatacodes', '/api/super/blacklist/all',
  '/api/brokers/importer', '/api/public/click',RegExp('/api/public/*'),
  new RegExp(`categories/(${Offerings.join('|')})`)
];
app.use(express.static(path.join(__dirname, 'bookingclik-backoffice', '_site')));
app.use('/api/public/upload', express.static(path.join(__dirname, 'upload')));
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  if (RegExp(`^/api`).test(req.originalUrl) && req.body.cipher) {
    if (Object.keys(req.body).length !== 0) {
      req.body = Encryption.decrypt(req.body)
    }
    if (Object.keys(req.query).length !== 0) req.query = Encryption.decrypt(req.query)
    if (Object.keys(req.params).length !== 0) req.params = Encryption.decrypt(req.params)
  }
  next();
});
console.log('----- Working ------');
app.use('/api', jwt({ secret: process.env.JWT_SECRET || config.JWT_SECRET }).unless({ path: routesToByPass }))
app.use('/api', routes);

app.use(function (err, req, res, next) {
  console.log(err)
  console.log(err.code)
  if (err.code === 'permission_denied') {
    res.status(403).send({ error: 'Forbidden' });
  } else if (err.name === 'UnauthorizedError') {
    res.status(401).send({ error: 'Session time out!' });
  } else {
    console.log(err)
    res.status(500).send({ error: err.toString() });
  }
});

app.get('*', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'bookingclik-backoffice', '_site', 'index.html'));
});

let port = process.env.PORT || 4010;

db
  .authenticate()
  //.then(() => db.sync())
  .then(() => {
    app.listen(port, '0.0.0.0', () => console.log('App listening on port ' + port))

    if (!process.env.DEV) {
      return
    }
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(0);
  });

