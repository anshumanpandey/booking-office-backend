const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const VisitorModel = require('../model/VisitorModel');
const moment = require('moment');

router.post('/public/visitor/save', AsyncMiddleware(async (req, res) => {

  const data = {
    ...req.body,
    pickupDate: moment.utc(req.body.pickupDate, 'YYYY-MM-DD').toDate(),
    pickupTime: moment.utc(req.body.pickupTime, 'HH:mm').utc().toDate(),

    dropoffDate: moment.utc(req.body.dropoffDate, 'YYYY-MM-DD').toDate(),
    dropoffTime: moment.utc(req.body.dropoffTime, 'HH:mm').toDate(),
  }
  await VisitorModel.create(data);
  res.send({});
}));

router.get('/public/visitor/get', AsyncMiddleware(async (req, res) => {
  res.send(await VisitorModel.findAll());
}));


module.exports = router;