const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const { isAuthenticated } = require('../helpers/auth');

router.get('/orders/add', isAuthenticated, (req, res) => {
    res.render('orders/new-order');
});

router.post('/orders/new-order', isAuthenticated, async (req, res) => {
    const {customer, delivered, delivery_date, devices:{quantity, amount}, total } = req.body;
    const errors = [];
    if(!customer){
        errors.push({text: 'Please insert a customer'});
    }
    if(!delivered){
        errors.push({text: 'Please confirm the deliver'});
    }
    if(errors.length > 0){
        res.render('orders/new-order', {
            errors,
            customer, 
            delivered, 
            delivery_date, 
            quantity, 
            amount, 
            total
        });
    }
    else {
        const newOrder = new Order({customer, delivered, delivery_date, devices:{quantity, amount}, total});
        await newOrder.save();
        req.flash('success_msg', 'Order added successfully');
        res.redirect('/orders');
    }
});

router.get('/orders', isAuthenticated, async (req, res) => {
    const orders = await Order.find().lean().sort({date: 'desc'});
    res.render('orders/all-orders', {orders});
});

module.exports = router;