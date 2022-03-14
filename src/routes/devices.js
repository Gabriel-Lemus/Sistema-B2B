const express = require('express');
const router = express.Router();

const Device = require('../models/Device');

router.get('/devices/add', (req, res) => {
    res.render('devices/new-device');
});

router.post('/devices/new-device', async (req, res) => {
    const {title, description} = req.body;
    const errors = [];
    if(!title){
        errors.push({text: 'Please write a title'});
    }
    if(!description){
        errors.push({text: 'Please write a description'});
    }
    if(errors.length > 0){
        res.render('devices/new-device', {
            errors,
            title,
            description
        });
    }
    else {
        const newDevice = new Device({title,description});
        await newDevice.save();
        res.redirect('/devices');
    }
});

router.get('/devices', (req, res) => {
    res.send('Devices from DataBase');
});

module.exports = router;