const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
  factoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  model_code: { type: String, required: true },
  color: { type: String, required: true },
  category: { type: String, required: true },
  warranty_time: { type: Number, required: true },
  shipping_time: { type: Number, required: true },
  images: { type: Array, required: true },
});

module.exports = mongoose.model("Device", DeviceSchema);
