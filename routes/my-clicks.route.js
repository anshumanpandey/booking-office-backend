const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const ClickTrack = require('../model/ClickTrack');

router.get('/clicks/', AsyncMiddleware(async (req, res) => {

    const clicks = await ClickTrack.findAll({ where: {UserId: req.user.id}, order: [['created_at', 'DESC']] })

    res.send(clicks);
}))

module.exports = router;
