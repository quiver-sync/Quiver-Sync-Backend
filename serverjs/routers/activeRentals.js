const express = require('express');
const router = express.Router();
const { confirmRentalRequest } = require('../controllers/activeRentalController');
const protect = require("../middelwares/authMiddleware");

router.post('/from-request/:requestId', protect, confirmRentalRequest);

module.exports = router;
