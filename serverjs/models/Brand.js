// models/Brand.js
const mongoose = require("mongoose");

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  models: [String],
});
module.exports = mongoose.model("Brand", brandSchema);
