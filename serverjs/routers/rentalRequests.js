const express = require('express');
const router = express.Router();
const {
  createRentalRequest,
  getMyRequests,
  getRequestsReceived,
  updateRentalRequest,
  getReceivedRequests,
  deleteRentalRequest,
} = require('../controllers/rentalRequestController');
const protect = require("../middelwares/authMiddleware");

router.post('/', protect, createRentalRequest);
router.get('/mine', protect, getMyRequests);
router.get('/received', protect, getRequestsReceived);
router.put('/:id', protect, updateRentalRequest);
router.get("/received-renter", protect, getReceivedRequests);
router.delete('/:id', protect, deleteRentalRequest);


module.exports = router;
