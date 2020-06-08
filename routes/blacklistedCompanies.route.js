const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../utils/AsyncMiddleware');
const BlacklistedCompany = require('../model/BlacklistedCompany');

router.get('/blacklisted', AsyncMiddleware(async (req, res) => {
    res.send(await BlacklistedCompany.findAll({ where: {UserId: req.user.id} }));
}))

router.post('/blacklisted/post', AsyncMiddleware(async (req, res) => {
    const { companyName } = req.body;

    await BlacklistedCompany.create({ companyName, UserId: req.user.id})

    res.send({});
}))

router.put('/blacklisted/put', AsyncMiddleware(async (req, res) => {
    const { company } = req.body;
    if (!company) throw new Error("Missing company");
    if (!company.id) throw new Error("Invalid company");
    
    await BlacklistedCompany.update(company,{ where: { id: company.id, UserId: req.user.id}})

    res.send({});
}))

router.delete('/blacklisted/delete', AsyncMiddleware(async (req, res) => {
    const { id } = req.body;
    
    await BlacklistedCompany.destroy({ where: {id: id, UserId: req.user.id}})

    res.send({});
}))

module.exports = router;
