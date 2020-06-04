const express = require('express');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const PaymentModel = require('../model/PaymentsModel');
const UserModel = require('../model/UserModel');
const sequelize = require('../utils/Database');
const moment = require('moment');

router.post('/paypal-transaction-complete', AsyncMiddleware(async (req, res) => {
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(req.body.orderId);

  /*
  TEST credentials*/
  const CLIENT_ID = 'AcDoYg60CAk48yIdgpLTKR8h99G9sdv_Xmdg8jzd8HTla_01m29inTc7d-kT5MdRwYcnpq5GmrdXbt4A';
  const CLIENT_SECRET = 'ENs8H1feFUXDKdKOf3WZbqpFOempJlLR13ntsM7VwzuaJIzK-aRuRh_z9yVS2zuCldnTDyj19elOdZFO';
  const enviroment = new checkoutNodeJssdk.core.SandboxEnvironment(CLIENT_ID,CLIENT_SECRET)
  

  /*const CLIENT_ID = '';
  const CLIENT_SECRET = '';
  const enviroment = new checkoutNodeJssdk.core.LiveEnvironment(CLIENT_ID, CLIENT_SECRET)*/

  const payPalClient = new checkoutNodeJssdk.core.PayPalHttpClient(enviroment);

  let order;
  try {
    order = await payPalClient.execute(request);
  } catch (err) {
    // 4. Handle any errors from the call
    console.error(err);
    return res.send(500);
  }

  await sequelize.transaction(async (t) => {
    const user = await UserModel.findByPk(req.user.id, { transaction: t });

    const credits = user.credits + (order.result.purchase_units[0].amount.value * req.user.costPerClick)
    await UserModel.update({ credits }, { where: { id: req.user.id }, transaction: t });
    const createdPayment = await PaymentModel.create({ orderId: req.body.orderId, UserId: req.user.id, amount: order.result.purchase_units[0].amount.value }, { transaction: t });

    res.send(createdPayment);
  })

}));

router.get('/paypal-transactions', AsyncMiddleware(async (req, res) => {

  const transacctions = await PaymentModel.findAll({ where: { UserId: req.user.id } })

  res.send(transacctions.map(t => {
    const j = t.toJSON();
    return {
      ...j,
      createdAt: moment(j.createdAt).format('YYYY-MM-DD hh:mm A')
    }
  }));
}));

module.exports = router;