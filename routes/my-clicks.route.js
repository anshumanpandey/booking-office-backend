const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const moment = require('moment');
const AsyncMiddleware = require('../utils/AsyncMiddleware');

router.get('/clicks/', AsyncMiddleware(async (req, res) => {

    const clicks = await ClickTrack.findAll({ where: {clientId: req.user.client.id}, order: [['created_at', 'DESC']] })

    res.send(clicks);
}))

module.exports = router;
