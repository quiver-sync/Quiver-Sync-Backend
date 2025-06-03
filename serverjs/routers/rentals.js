const express = require("express");
const router = express.Router();
const protect = require("../middelwares/authMiddleware");

const {
  createRental,
  getMyRentals,
  // deleteRental,
  updateRental,
  getAvailableRentals,
  getRentalById,
  deleteRentalIfAllowed,
} = require("../controllers/rentalController");

router.use(protect);

router.post("/", createRental);             
router.get("/mine", getMyRentals);          
router.get("/available", getAvailableRentals); 
router.get("/:id", getRentalById);          
router.patch("/:id", protect,updateRental);       
// router.delete("/:id", deleteRental);   
router.delete("/:id",protect, deleteRentalIfAllowed);      


module.exports = router;
