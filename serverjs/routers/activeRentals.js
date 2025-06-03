const express = require("express");
const router = express.Router();
const {
  confirmRentalRequest,
  getMyActiveRentals,
  getAllActiveRentals,
  cancelRentalIfNoUpcoming,
} = require("../controllers/activeRentalController");
const protect = require("../middelwares/authMiddleware");

router.post("/from-request/:requestId", protect, confirmRentalRequest);
router.get("/mine", protect, getMyActiveRentals);
router.get("/all", protect, getAllActiveRentals);
router.delete('/cancel/:rentalId', protect, cancelRentalIfNoUpcoming);

module.exports = router;
