const express = require('express');
const router = express.Router();

const MyClicks = require('./my-clicks.route');
const payments = require('./payments.route');
const ClientRoute = require('./client.route');

router.use(MyClicks);
router.use(payments);
router.use(ClientRoute);

router.get('/test', (req, res) => {
    return res.send({ success: true });
  })

module.exports = router;