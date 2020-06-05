const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const BlacklistedCompany = require('../../model/BlacklistedCompany');

router.get('/public/super/blacklist/all', AsyncMiddleware(async (req, res) => {
    res.send(await BlacklistedCompany.findAll());
}))

router.post('/super/blacklist/', AsyncMiddleware(async (req, res) => {
    const { companies } = req.body;
    if (companies.some(i => !i.companyName)) throw new Error("Invalid body");
    
    await BlacklistedCompany.bulkCreate(companies.map(i => ({ companyName: i.companyName })))

    res.send({});
}))

router.put('/super/blacklist/', AsyncMiddleware(async (req, res) => {
    const { company } = req.body;
    if (!company) throw new Error("Missing company");
    if (!company.id) throw new Error("Invalid company");
    
    await BlacklistedCompany.update(company,{ where: { id: company.id}})

    res.send({});
}))

router.delete('/super/blacklist/', AsyncMiddleware(async (req, res) => {
    const { id } = req.body;
    
    await BlacklistedCompany.destroy({ where: {id: id}})

    res.send({});
}))

module.exports = router;
