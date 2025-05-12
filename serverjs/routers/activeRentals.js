const express = require('express');
const router = express.Router();
const { confirmRentalRequest, getMyActiveRentals } = require('../controllers/activeRentalController');
const protect = require("../middelwares/authMiddleware");

// Confirm rental after approval
router.post('/from-request/:requestId', protect, confirmRentalRequest);

// Get active rentals for current user
router.get('/mine', protect, getMyActiveRentals);

module.exports = router;
