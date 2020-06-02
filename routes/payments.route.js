const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const PaymentModel = require('../model/PaymentsModel');

router.post('/paypal-transaction-complete', AsyncMiddleware(async (req, res) => {

  const order = await PaymentModel.create({ orderId: req.body.orderId, clientId: req.user.id });

  res.send(order);
}));

router.get('/paypal-transactions', AsyncMiddleware(async (req, res) => {

  const transacctions = await PaymentModel.findAll({ where: { clientId: req.user.id }})

  res.send(transacctions);
}));

module.exports = router;