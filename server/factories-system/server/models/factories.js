const mongoose = require("mongoose");

const FactorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  salt: { type: String, required: true },
  hash: { type: String, required: true },
});

module.exports = mongoose.model("Factory", FactorySchema);
