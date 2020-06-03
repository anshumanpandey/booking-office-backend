const express = require('express');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const PaymentModel = require('../model/PaymentsModel');
const UserModel = require('../model/UserModel');
const sequelize = require('../utils/Database');

router.post('/paypal-transaction-complete', AsyncMiddleware(async (req, res) => {
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(req.body.orderId);

  const enviroment = new checkoutNodeJssdk.core.SandboxEnvironment(
    'AbBy2EJkKQpvu6zmf9gaySHsC5UK-mFjwqI_zLxaNCS60V4cIDU4mR7o5LsBtIU8KAjrh4yqdzsu3J_N',
    'EOAfjk4-jQpSRODRe8FEPeg2X29H8fpW6XHxDjMt92kRYbz62xKDU02BIrLDSlfLFFpiFSyuj7BV8Tqw')
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
    const user = await UserModel.findByPk(req.user.id ,{ transaction: t});

    const credits = user.credits + (order.result.purchase_units[0].amount.value * req.user.costPerClick)
    await UserModel.update({ credits }, { where: { id: req.user.id} ,transaction: t});
    const createdPayment = await PaymentModel.create({ orderId: req.body.orderId, UserId: req.user.id }, {transaction: t});

    res.send(createdPayment);
  })

}));

router.get('/paypal-transactions', AsyncMiddleware(async (req, res) => {

  const transacctions = await PaymentModel.findAll({ where: { UserId: req.user.id } })

  res.send(transacctions);
}));

module.exports = router;