const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  availableUntil: { type: Date, required: true },
  agreementAccepted: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Rental", RentalSchema);
