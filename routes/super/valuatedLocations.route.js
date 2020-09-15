const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const ValuatedLocation = require('../../model/ValuatedLocation');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });
const sequelize = require('../../utils/Database');
const { Op } = require('sequelize');

router.get('/public/valuated-locations/get', AsyncMiddleware(async (req, res) => {
    const from = req.query.from
    const to = req.query.to
    const data = await ValuatedLocation.findAll({ where: { value: { [Op.between]: [parseInt(from), parseInt(to)] }}});
    res.send(data);
}));

router.get('/valuated-locations/get', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    const data = await ValuatedLocation.findAll();
    res.send(data);
}));

router.delete('/valuated-locations/delete', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    await ValuatedLocation.destroy({ where: { id: req.body.id }});
    res.send({});
}));

router.post('/valuated-locations/save', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
    await sequelize.transaction(async (transaction) => {
        if (req.body.id) {
            const newData = {}
            if (req.body.name) newData.name = req.body.name
            if (req.body.value) newData.value = req.body.value
            if (req.body.grcgdsClientId) newData.grcgdsClientId = req.body.grcgdsClientId

            await ValuatedLocation.update(newData, { where: { id: req.body.id },transaction })

        } else {
            if (!req.body.name) throw new Error("Missing name")
            if (!req.body.value) throw new Error("Missing value")

            await ValuatedLocation.create(req.body, { transaction })
        }

        res.send({});
    })
}));


module.exports = router
