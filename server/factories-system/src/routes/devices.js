const express = require('express');
const router = express.Router();

const Device = require('../models/Device');

router.get('/devices/add', (req, res) => {
    res.render('devices/new-device');
});

router.post('/devices/new-device', async (req, res) => {
    const {title, description, model_code, category, kind, brand, color, warranty_time, shipping_time, price } = req.body;
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
            description, 
            model_code, 
            category, 
            kind, 
            brand, 
            color, 
            warranty_time, 
            shipping_time, 
            price
        });
    }
    else {
        const newDevice = new Device({title, description, model_code, category, kind, brand, color, warranty_time, shipping_time, price});
        await newDevice.save();
        req.flash('success_msg', 'Device added successfully');
        res.redirect('/devices');
    }
});

router.get('/devices', async (req, res) => {
    const devices = await Device.find().lean().sort({date: 'desc'});
    res.render('devices/all-devices', {devices});
});

router.get('/devices/edit/:id', async (req, res) => {
    const device = await Device.findById(req.params.id).lean();
    res.render('devices/edit-device', {device});
});

router.put('/devices/edit-device/:id', async (req, res) => {
    const {title, description, model_code, category, kind, brand, color, warranty_time, shipping_time, price } = req.body;
    await Device.findByIdAndUpdate(req.params.id,{title, description, model_code, category, kind, brand, color, warranty_time, shipping_time, price });
    req.flash('success_msg', 'Device updated successfully');
    res.redirect('/devices');
});

router.delete('/devices/delete/:id', async (req, res) => {
    await Device.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Device deleted successfully');
    res.redirect('/devices');
});

module.exports = router;