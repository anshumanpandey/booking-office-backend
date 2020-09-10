const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const AboutModel = require('../../model/AboutModel');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });

router.get('/about/get', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    const data = await AboutModel.findOne();
    res.send(data);
}));

router.put('/about/edit', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    const data = await AboutModel.findOne();
    await data.update({ body: req.body.body })
    res.send(data);
}));




module.exports = router
