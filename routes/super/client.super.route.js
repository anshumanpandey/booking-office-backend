const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const UserModel = require('../../model/UserModel');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });

router.get('/super/client',  guard.check('super_admin'),AsyncMiddleware(async (req, res) => {
    const clients = await UserModel.findAll({ where: { type: 'company'}, include: { all: true }});
  
    res.send(clients.map(client => {
        const c = client.toJSON();
        delete c.password
        return c;
    }));
  }));

module.exports = router
