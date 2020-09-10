const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const TopLocationModel = require('../../model/TopLocationModel');
const guard = require('express-jwt-permissions')({ permissionsProperty: 'type' });
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../../utils/Database');

router.get('/public/top-locations/get', AsyncMiddleware(async (req, res) => {
    const data = await TopLocationModel.findAll();
    res.send(data);
}));

router.get('/top-locations/get', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    const data = await TopLocationModel.findAll();
    res.send(data);
}));

router.delete('/top-locations/delete', guard.check([['super_admin']]), AsyncMiddleware(async (req, res) => {
    await TopLocationModel.destroy({ where: { id: req.body.id }});
    res.send({});
}));

router.post('/top-locations/save', guard.check('super_admin'), AsyncMiddleware(async (req, res) => {
    await sequelize.transaction(async (transaction) => {
        if (req.body.id) {
            const newData = {}
            if (req.body.name) newData.name = req.body.name
            if (req.files["img"]) {
                const randomDesktopName = uuidv4();
                const fileName = `${randomDesktopName}.${req.files["img"].mimetype.split('/')[1] || 'png'}`;
                await req.files["img"].mv(`./locationimgs/${fileName}`);
                newData.imagePath = `https://www.bookingclik.com/preview/locationimgs/${fileName}`
            }

            await TopLocationModel.update(newData, { where: { id: req.body.id },transaction })

        } else {
            if (!req.files["img"]) throw new Error("Missing file")
            if (!req.body.name) throw new Error("Missing name")

            const randomDesktopName = uuidv4();
            const fileName = `${randomDesktopName}.${req.files["img"].mimetype.split('/')[1] || 'png'}`;
            await req.files["img"].mv(`./locationimgs/${fileName}`);

            await TopLocationModel.create({ name: req.body.name, imagePath: `https://www.bookingclik.com/preview/locationimgs/${fileName}` }, { transaction })
        }

        res.send({});
    })
}));


module.exports = router
