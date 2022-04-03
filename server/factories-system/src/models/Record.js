const mongoose = require('mongoose');
const {Schema} = mongoose;

const RecordSchema = new Schema({
    customer: {type: String, required: true},
    date: {type: Date, default: Date.now, required: true}
});

module.exports = mongoose.model('Record', DeviceSchema);