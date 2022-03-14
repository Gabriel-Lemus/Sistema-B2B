const mongoose = require('mongoose');
const {Schema} = mongoose;

const DeviceSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    model_code: {type: String, required: true},
    category: {type: String, required: true},
    kind: {type: String, required: true},
    brand: {type: String, required: true},
    color: {type: String, required: true},
    warranty_time: {type: Number, required: true},
    shipping_time: {type: Number, required: true},
    price: {type: Number, required: true}
});

module.exports = mongoose.model('Device', DeviceSchema);