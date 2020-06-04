const express = require('express');
const router = express.Router();
const Op = require('sequelize').Op;
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const UserModel = require('../model/UserModel');
const ClickTrackModel = require('../model/ClickTrack');

router.post('/public/click', AsyncMiddleware(async (req, res) => {
  const { supplier_id, country_code, ip } = req.body;
  if (!supplier_id) throw new Error("Missing supplier_id param");
  if (!country_code) throw new Error("Missing country_code param");
  if (!ip) throw new Error("Missing ip param");

  const user = await UserModel.findOne({ where: {grcgdsId: supplier_id }});

  if (!user) throw new Error("Supplier not found");

  if (user.credits > 0) {
    await ClickTrackModel.create({ ip, country:country_code, UserId: user.id  });
    await user.update({ credits: user.credits - 1 });
  } else {
    throw new Error("Service not available");
  }
  res.send({});
}));


module.exports = router;