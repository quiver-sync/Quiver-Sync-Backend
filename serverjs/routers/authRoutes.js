const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  googleSignIn,
  saveBrands,
  getAllBrands,
} = require("../controllers/authController");
const protect = require("../middelwares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/google", googleSignIn);
router.get("/refresh", refreshToken);
router.get("/profile", protect ,getProfile);
router.put("/profile", protect, updateProfile);
router.post("/add", saveBrands);
router.get("/getbrands", getAllBrands);



// Protected route
router.get("/me", protect, getMe);

module.exports = router;