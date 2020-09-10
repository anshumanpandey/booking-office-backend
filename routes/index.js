const express = require('express');
const router = express.Router();

const MyClicks = require('./my-clicks.route');
const payments = require('./payments.route');
const ClientRoute = require('./client.route');
const ClickRoute = require('./click.route');
const superClient = require('./super/client.super.route');
const bannerMeta = require('./super/bannerMeta.route');
const topLocations = require('./super/topLocations.route');
const about = require('./super/about.route');
const blacklistedSuper = require('./super/blacklistedCompanies.route');
const visitor = require('./visitor.route');
const banner = require('./banner.route');

router.use(banner);
router.use(bannerMeta);
router.use(topLocations);
router.use(about);
router.use(visitor);
router.use(blacklistedSuper);
router.use(ClickRoute);
router.use(MyClicks);
router.use(payments);
router.use(ClientRoute);
router.use(superClient);

router.get('/test', (req, res) => {
    return res.send({ success: true });
  })

module.exports = router;