const express = require('express');
const router = express.Router();

const Customer = require('../models/Customer');
const { isAuthenticated } = require('../helpers/auth');

router.get('/customers/add', isAuthenticated, (req, res) => {
    res.render('customers/new-customer');
});

router.post('/customers/new-customer', isAuthenticated, async (req, res) => {
    const {name, email, password, confirm_password, shipping_time } = req.body;
    const errors = [];
    if(name.length <= 0){
        errors.push({text: 'Please insert a name'});
    }
    if(email.length <= 0){
        errors.push({text: 'Please insert an email'});
    }
    if(password != confirm_password){
        errors.push({text: 'Password do not match'});
    }
    if(password.length < 4){
        errors.push({text: 'Password must be at least 4 characters'});
    }
    if(shipping_time.length <= 0){
        errors.push({text: 'Please insert a shipping time for orders'});
    }
    if(errors.length > 0){
        res.render('customers/new-customer', {
            errors,
            name, 
            email, 
            password,
            confirm_password,
            shipping_time
        });
    }
    else {
        const emailCustomer = await Customer.findOne({email: email});
        if(emailCustomer){
            req.flash('error_msg', 'Email already exists');
            res.redirect('/customers/new-customer');
        }
        else{
            const newCustomer = new Customer({name, email, password, shipping_time});
            newCustomer.password = await newCustomer.encryptPassword(password);
            await newCustomer.save();
            req.flash('success_msg', 'Customer added successfully');
            res.redirect('/customers');
        }
    }
});

router.get('/customers', isAuthenticated, async (req, res) => {
    const customers = await Customer.find().lean().sort({date: 'desc'});
    res.render('customers/all-customers', {customers});
});

router.get('/customers/edit/:id', isAuthenticated, async (req, res) => {
    const customer = await Customer.findById(req.params.id).lean();
    res.render('customers/edit-customer', {customer});
});

router.put('/customers/edit-customer/:id', isAuthenticated, async (req, res) => {
    const {name, email, password, shipping_time } = req.body;
    await Customer.findByIdAndUpdate(req.params.id,{name, email, password, shipping_time });
    req.flash('success_msg', 'Customer updated successfully');
    res.redirect('/customers');
});

router.delete('/customers/delete/:id', isAuthenticated, async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'Customer deleted successfully');
    res.redirect('/customers');
});

module.exports = router;