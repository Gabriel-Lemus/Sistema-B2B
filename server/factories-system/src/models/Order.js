const mongoose = require('mongoose');
const {Schema} = mongoose;

const OrderSchema = new Schema({
    customer: {type: String, required: true},
    delivered: {type: Boolean, required: true},
    delivery_date: {type: String, required: true},
    devices: [{
        quantity: {type: Number, required: true},
        amount: {type: Number, required: true}
    }],
    total: {type: Number, required: true}
});

module.exports = mongoose.model('Order', OrderSchema);