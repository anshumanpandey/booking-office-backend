const express = require('express');
const router = express.Router();
const Op = require('sequelize').Op;
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const UserModel = require('../model/UserModel');
const ClickTrackModel = require('../model/ClickTrack');
const sequelize = require('../utils/Database');

router.post('/public/click', AsyncMiddleware(async (req, res) => {
  const { company_name, country_code, ip } = req.body;
  if (!company_name) throw new Error("Missing company_name param");
  if (!country_code) throw new Error("Missing country_code param");
  if (!ip) throw new Error("Missing ip param");

  await sequelize.transaction(async (t) => {
    const user = await UserModel.findOne({ where: { companyName: company_name }, transaction: t });

    if (!user) throw new Error("Supplier not found");

    if (user.credits > 0) {
      await ClickTrackModel.create({ ip, country: country_code, UserId: user.id }, { transaction: t });
      await user.update({ credits: user.credits - 1 }, { transaction: t });
    } else {
      throw new Error("Service not available");
    }

  })

  res.send({});
}));


module.exports = router;