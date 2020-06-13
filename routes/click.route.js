const express = require('express');
const router = express.Router();
const Op = require('sequelize').Op;
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const UserModel = require('../model/UserModel');
const ClickTrackModel = require('../model/ClickTrack');
const sequelize = require('../utils/Database');
const Decimal = require('decimal.js');
const moment = require('moment');

router.post('/public/click', AsyncMiddleware(async (req, res) => {
  const {
    grcgds_supplier_name,
    country_code,
    ip,
    orignal_supplier_name,
    pickupLocation,
    dropoffLocation,
  } = req.body;

  await sequelize.transaction(async (t) => {
    const user = await UserModel.findOne({ where: { companyName: grcgds_supplier_name }, ransaction: t });
    if (!user) throw new Error("Supplier not found");

    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');

    const click = await ClickTrackModel.findOne({
      where: {
        ip,
        UserId: user.id,
      },
      order: [['created_at', 'DESC']],
      transaction: t,
    });

    if (click) {
      const clickDate = moment(click.created_at);

      if (clickDate.isBetween(startOfDay, endOfDay)) {
        // we alredy tracked a click from this IP for this user... skip
        return;
      }
    }

    if (user.credits > 0) {
      const data = {
        ip,
        country: country_code,
        supplierName: orignal_supplier_name,
        UserId: user.id,
        pickupLocation,
        dropoffLocation,
      }
      await ClickTrackModel.create(data, { transaction: t });
      await user.update({credits: new Decimal(user.credits).minus(1), balance: new Decimal(user.balance).minus(user.costPerClick) }, { transaction: t });
    } else {
      throw new Error("Service not available");
    }

  })

  res.send({});
}));

router.get('/public/unavailables', AsyncMiddleware(async (req, res) => {

  const users = await UserModel.findAll({ where: { type: { [Op.not]: 'super_admin' } } });

  res.send(users.filter(u => u.credits <= 0 && u.companyName).map(i => ({ companyName: i.companyName })));
}));


module.exports = router;