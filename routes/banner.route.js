const express = require('express');
const router = express.Router();
const moment = require('moment');
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const BannerMetaPurchasedModel = require('../model/BannerMetaPurchasedModel');
const BannerMetaModel = require('../model/BannerMetaModel');
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
  const enviroment = new checkoutNodeJssdk.core.SandboxEnvironment(CLIENT_ID, CLIENT_SECRET)

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
    const bannersToUpdate = await BannerMetaModel
      .findAll({
        where: { id: req.body.selectedLocations.map(l => l.id) }, include: [
          {
            model: BannerMetaPurchasedModel,
            attributes: ['availableFromDate', 'availableToDate'],
          }
        ], transaction: t
      });
    await BannerMetaPurchasedModel.bulkCreate(req.body.selectedLocations.map((l, idx, arr) => {
      const currentBannerMetadata = bannersToUpdate.find(currentBanner => currentBanner.id == l.id)
      if (!currentBannerMetadata) throw new Error("We could not find the banner.")

      const isFilled = currentBannerMetadata.BannerPurchaseds.some(purchasedBanner => {
        const availableFromDate = moment(purchasedBanner.availableFromDate)
        const availableToDate = moment(purchasedBanner.availableToDate)
        const isBetween = moment.unix(l.fromDate).utc().isBetween(availableFromDate, availableToDate, undefined, '[]') ||
          moment.unix(l.toDate).utc().isBetween(availableFromDate, availableToDate, undefined, '[]');
        const isInside = availableFromDate.isBetween(l.fromDate, l.toDate, undefined, '[]') ||
          availableToDate.isBetween(l.fromDate, l.toDate, undefined, '[]');
        return (isBetween || isInside)
      })

      if (isFilled) throw new Error("The selected date range is already used")


      const availableFromDate = moment.unix(l.fromDate).utc();
      const availableToDate = moment.unix(l.toDate).utc();

      if (availableFromDate.isAfter(availableToDate)) throw new Error('Start date cannot be after end date');
      if (availableToDate.isBefore(availableFromDate)) throw new Error('End date cannot be before start date');

      const data = {
        availableFromDate: availableFromDate.toDate(),
        availableToDate: availableToDate.toDate(),
        paypalOrderId: req.body.orderId,
        UserId: req.user.id,
        BannerMetumId: l.id
      }

      return data;
    }), { transaction: t })

    await Promise.all(bannersToUpdate.map(b => b.update({ availableAmount: b.availableAmount - 1 }, { transaction: t })))

    const paymentData = { orderId: req.body.orderId, UserId: req.user.id, amount: order.result.purchase_units[0].amount.value, buyedItem: 'Ads' }
    const createdPayment = await PaymentModel.create(paymentData, { transaction: t });

    res.send(createdPayment);
  })

}));

router.get('/banner/get', AsyncMiddleware(async (req, res) => {
  const data = await BannerMetaPurchasedModel.findAll({
    where: { UserId: req.user.id },
    include: { all: true }
  })
  const toSend = data.map(d => {
    return {
      ...d.toJSON(),
      User: {
        firstName: d.User.firstName
      },
      BannerMetum: {
        locationName: d.BannerMetum.locationName,
        country: d.BannerMetum.country
      }
    }
  })
  res.send(toSend);
}));


module.exports = router;