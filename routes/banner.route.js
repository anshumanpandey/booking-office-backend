const express = require('express');
const router = express.Router();
const moment = require('moment');
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const BannerMetaPurchasedModel = require('../model/BannerMetaPurchasedModel');
const BannerMetaModel = require('../model/BannerMetaModel');
const PaymentModel = require('../model/PaymentsModel');
const { v4: uuidv4 } = require('uuid');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
const sequelize = require('../utils/Database');
const sizeOf = require('image-size');

router.post('/banners-payment', AsyncMiddleware(async (req, res) => {
  if (!req.body.orderId) throw new Error("Missing param");
  if (!req.body.selectedLocations) throw new Error("Missing param");
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(req.body.orderId);

  const desktopDimensions = sizeOf(`${req.files["desktopImage"].tempFilePath}`);
  if (desktopDimensions.width !== 160, desktopDimensions.height !== 600) throw new Error("Desktop image must be of a size of 160*600");
  const mobileDimensions = sizeOf(`${req.files["mobileImage"].tempFilePath}`);
  if (mobileDimensions.width !== 1382, mobileDimensions.height !== 200) throw new Error("Mobile image must be of a size of 1382*200");

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

    const randomDesktopName = uuidv4();
    const randomMobileName = uuidv4();

    await BannerMetaPurchasedModel.bulkCreate(req.body.selectedLocations.map((l, idx, arr) => {
      const currentBannerMetadata = bannersToUpdate.find(currentBanner => currentBanner.id == l.id)
      if (!currentBannerMetadata) throw new Error("We could not find the banner.")
      if (currentBannerMetadata.availableAmount <= 0) throw new Error("No banners available")

      const availableFromDate = moment.unix(l.fromDate).utc().startOf('day');
      const availableToDate = moment.unix(l.toDate).utc().endOf('day');

      if (availableFromDate.isAfter(availableToDate)) throw new Error('Start date cannot be after end date');
      if (availableToDate.isBefore(availableFromDate)) throw new Error('End date cannot be before start date');

      const data = {
        availableFromDate: availableFromDate.toDate(),
        availableToDate: availableToDate.toDate(),
        paypalOrderId: req.body.orderId,
        UserId: req.user.id,
        BannerMetumId: l.id,
        desktopBannerFileName: randomDesktopName,
        mobileBannerFileName: randomMobileName,
        urlToOpen: req.body.urlToOpen,
      }

      return data;
    }), { transaction: t })

    await Promise.all(bannersToUpdate.map(b => b.update({ availableAmount: b.availableAmount - 1 }, { transaction: t })))

    const paymentData = { orderId: req.body.orderId, UserId: req.user.id, amount: order.result.purchase_units[0].amount.value, buyedItem: 'Ads' }
    const createdPayment = await PaymentModel.create(paymentData, { transaction: t });

    await req.files["desktopImage"].mv(`./banners/${randomDesktopName}.png`);
    await req.files["mobileImage"].mv(`./banners/${randomMobileName}.png`);


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