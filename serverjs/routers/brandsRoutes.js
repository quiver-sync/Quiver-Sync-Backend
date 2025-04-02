const express = require("express");
const router = express.Router();
const {
    saveBrands,
    getAllBrands,
  } = require("../controllers/brandController");

router.post("/", saveBrands);
router.get("/", getAllBrands);

module.exports = router;
