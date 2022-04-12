const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  shippingTimes: [
    {
      factoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Factory" },
      shippingTime: { type: Number, required: true }
    }
  ],
});

module.exports = mongoose.model("Client", ClientSchema);
