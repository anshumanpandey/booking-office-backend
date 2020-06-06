const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const ClickTrack = require('../model/ClickTrack');
const UserModel = require('../model/UserModel');

router.get('/clicks/', AsyncMiddleware(async (req, res) => {

    const clicks = await ClickTrack.findAll({
        where: {UserId: req.user.id},
        include: [{ model: UserModel }],
        order: [['created_at', 'DESC']]
    })

    const data = clicks.map(i => {
        const json = i.toJSON();
        return {
            ...json,
            User: {
                id: json.User.id,
                companyName: json.User.companyName,
            }
        }
    })
    res.send(data);
}))

module.exports = router;
