const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brand: { type: String, required: true },
  type: { type: String, enum: ["shortboard", "longboard", "funboard", "fish", "gun", "softtop"], required: true },
  model: { type: String },
  length: { type: Number, required: true }, // in feet
  width: { type: Number },
  volume: { type: Number }, // in liters
  fins: { type: String },
  image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);
