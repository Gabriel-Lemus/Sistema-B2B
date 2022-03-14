const mongoose = require('mongoose');
const {Schema} = mongoose;

const DeviceSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
});

module.exports = mongoose.model('Device', DeviceSchema);