const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  completed: { type: Boolean, required: true },
  maxDeliveryDate: { type: Date, required: false },
  deliveredDate: { type: Date, required: false },
  canceled: { type: Boolean, required: true },
  completelyPayed: { type: Boolean, required: false },
  devices: [
    {
      factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory" },
      deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Device" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      estimatedDeliveryDate: { type: Date, required: false },
      delivered: { type: Boolean, required: true },
      payed: { type: Boolean, required: true },
      deliveredDate: { type: Date, required: false },
      canBeDisplayed: { type: Boolean, required: true },
      displayed: { type: Boolean, required: true },
    },
  ],
});

module.exports = mongoose.model("Order", OrderSchema);
