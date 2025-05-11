const express = require('express');
const router = express.Router();
const {
  createRentalRequest,
  getMyRequests,
  getRequestsReceived,
  updateRentalRequest,
} = require('../controllers/rentalRequestController');
const protect = require("../middelwares/authMiddleware");

router.post('/', protect, createRentalRequest);
router.get('/mine', protect, getMyRequests);
router.get('/received', protect, getRequestsReceived);
router.put('/:id', protect, updateRentalRequest);

module.exports = router;
