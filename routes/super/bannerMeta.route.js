const express = require('express');
const router = express.Router();
const axios = require('axios');
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const BannerMetaModel = require('../../model/BannerMetaModel');
const Encryption = require('../../utils/Encryption');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });

router.get('/banner-meta/get', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
    res.send(await BannerMetaModel.findAll());
}));

router.put('/banner-meta/save', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
    if (!req.body.id) throw new Error("Missing ID");
    if (!await BannerMetaModel.findByPk(req.body.id)) throw new Error("Banner metadata not found");

    const toSave = {
        locationName: req.body.locationName,
        availableAmount: req.body.availableAmount,
        price: req.body.price,
    }
    await BannerMetaModel.update(toSave, {where: {id: req.body.id}})
    res.send({});
}));

axios.default({
    url: `https://www.grcgds.com/admincarrental/api/public/locationCodes`,
    method: 'POST'
})
.then(r => Encryption.decrypt(r.data))
.then(async data => {

    const all = await BannerMetaModel.findAll();

    const toSave = data.filter(locationFromService => {
        const found = all.find(bannerMeta => bannerMeta.locationName == locationFromService.locationname)
        return found == undefined;
    })
    
    return BannerMetaModel.bulkCreate(toSave.map(l => {
        return {
            locationName: l.locationname,
            availableAmount: 6,
            price: l.locationname.toLowerCase().match(/(airport)/) ? 5 : 2,
            availableFromDate: null,
            availableToDate: null,
        }
    }));
})
.then((r) => {
    console.log(`${r.length} new codes imported`)
})

module.exports = router
