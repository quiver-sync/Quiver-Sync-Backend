const mongoose = require("mongoose");

const RentalSchema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // 🧭 Display-friendly name (e.g., "Haifa, Israel")
  location: { type: String, required: true },

  // 🌍 GeoJSON Point for radius search
  locationCoords: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },

  pricePerDay: { type: Number, required: true },
  availableUntil: { type: Date, required: true },
  agreementAccepted: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  advanceNotes: { type: String },
  advanceRequired: { type: Number },
  advanceReason: { type: String },
});

// 🧭 Geospatial index for $near queries
RentalSchema.index({ locationCoords: "2dsphere" });

module.exports = mongoose.model("Rental", RentalSchema);
