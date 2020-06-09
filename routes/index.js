const express = require('express');
const router = express.Router();

const MyClicks = require('./my-clicks.route');
const payments = require('./payments.route');
const ClientRoute = require('./client.route');
const ClickRoute = require('./click.route');
const superClient = require('./super/client.super.route');
const blacklistedSuper = require('./super/blacklistedCompanies.route');
const blacklisted = require('./blacklistedCompanies.route');
const visitor = require('./visitor.route');

router.use(visitor);
router.use(blacklistedSuper);
router.use(blacklisted);
router.use(ClickRoute);
router.use(MyClicks);
router.use(payments);
router.use(ClientRoute);
router.use(superClient);

router.get('/test', (req, res) => {
    return res.send({ success: true });
  })

module.exports = router;