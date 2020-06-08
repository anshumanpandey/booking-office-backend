const express = require('express');
const router = express.Router();
const AsyncMiddleware = require('../../utils/AsyncMiddleware');
const BlacklistedCompany = require('../../model/BlacklistedCompany');
const UserModel = require('../../model/UserModel');

router.get('/public/super/blacklist/all', AsyncMiddleware(async (req, res) => {
    res.send(await BlacklistedCompany.findAll());
}))

router.post('/super/blacklist/', AsyncMiddleware(async (req, res) => {
    const { companyName, UserId } = req.body;
    if (!companyName) throw new Error("Missing companyName");
    if (!UserId) throw new Error("Missing UserId");

    if (!await UserModel.findByPk(UserId)) throw new Error ("User not found");
    
    await BlacklistedCompany.create({ companyName, UserId})

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
