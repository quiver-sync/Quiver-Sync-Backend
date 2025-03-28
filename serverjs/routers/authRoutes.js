const express = require("express");
const {
  register,
  login,
  getMe,
  logout,
  refreshToken,
} = require("../controllers/authController");
const protect = require("../middelwares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/refresh", refreshToken);

// Protected route
router.get("/me", protect, getMe);

module.exports = router;