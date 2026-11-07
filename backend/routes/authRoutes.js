const express = require("express");

const {
  registerUser,
  verifyEmail,
  resendCode,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-code", resendCode);
router.post("/login", loginUser);

// Protected route
router.get("/me", protect, getMe);

module.exports = router;