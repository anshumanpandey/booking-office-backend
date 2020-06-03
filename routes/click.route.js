const express = require('express');
const router = express.Router();
const Op = require('sequelize').Op;
const AsyncMiddleware = require('../utils/AsyncMiddleware');

router.post('/click', AsyncMiddleware(async (req, res) => {
  const { supplierId } = req.body;
  if (!supplierId) throw new Error("Missing supplierId param");

  const user = await UserModel.findByPk(supplierId ,{ transaction: t});

  if (!user) throw new Error("Supplier not found");

  await user.update({ credits: user.user - 1 });

  res.send({});
}));


module.exports = router;