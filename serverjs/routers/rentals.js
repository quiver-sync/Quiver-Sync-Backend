const express = require("express");
const router = express.Router();
const protect = require("../middelwares/authMiddleware");
const {
    createRental,
    getMyRentals,
  } = require("../controllers/rentalController");

router.post("/", protect,createRental);
router.get("/mine", protect,getMyRentals);

module.exports = router;
