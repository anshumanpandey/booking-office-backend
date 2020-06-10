const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const BannerModel = require('../model/BannerModel');
const PaymentModel = require('../model/PaymentsModel');
const UserModel = require('../model/UserModel');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const sequelize = require('../utils/Database');

router.post('/banners-payment', AsyncMiddleware(async (req, res) => {
  if (!req.body.orderId) throw new Error("Missing param");
  if (!req.body.selectedLocations) throw new Error("Missing param");
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(req.body.orderId);

  //TEST credentials
  const CLIENT_ID = 'AcDoYg60CAk48yIdgpLTKR8h99G9sdv_Xmdg8jzd8HTla_01m29inTc7d-kT5MdRwYcnpq5GmrdXbt4A';
  const CLIENT_SECRET = 'ENs8H1feFUXDKdKOf3WZbqpFOempJlLR13ntsM7VwzuaJIzK-aRuRh_z9yVS2zuCldnTDyj19elOdZFO';
  const enviroment = new checkoutNodeJssdk.core.SandboxEnvironment(CLIENT_ID,CLIENT_SECRET)

  /*const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
  const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
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
    await BannerModel.bulkCreate(req.body.selectedLocations.map((l) => {
      return {
        country: req.body.country,
        location: l.locationName,
        amount: l.amount,
        paymentFrequency: l.frequency,
        paypalId: req.body.orderId,
        UserId: req.user.id
      }
    }), { transaction: t })
    const paymentData = { orderId: req.body.orderId, UserId: req.user.id, amount: order.result.purchase_units[0].amount.value, buyedItem: 'Ads' }
    const createdPayment = await PaymentModel.create(paymentData, { transaction: t });

    res.send(createdPayment);
  })

}));

router.get('/banner/get', AsyncMiddleware(async (req, res) => {
  const data = await BannerModel.findAll({ where: { UserId: req.user.id },include: [{ model: UserModel }]})
  res.send(data.map(i => i.toJSON()).map(item => {
    return {
      ...item,
      User: {
        firstName: item.User.firstName
      }
    }
  }));
}));


module.exports = router;