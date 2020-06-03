const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const UserModel = require('../../model/UserModel');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });

router.get('/super/client', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
  const clients = await UserModel.findAll({ where: { type: 'company' }, include: { all: true } });

  res.send(clients.map(client => {
    const c = client.toJSON();
    delete c.password
    return c;
  }));
}));

router.put('/super/edit', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
  const { credits, costPerClick, supplierId} = req.body;
  if (!credits) throw new Error("Missing credits fields");
  if (!costPerClick) throw new Error("Missing costPerClick fields");
  if (!supplierId) throw new Error("Missing supplierId fields");

  const client = await UserModel.findByPk(supplierId);

  if (!client) throw new Error("Supplier not found");

  await UserModel.update({ credits, costPerClick }, { where: {id: supplierId}});

  res.send({ sucess: "Supplier updated"});
}));

module.exports = router
