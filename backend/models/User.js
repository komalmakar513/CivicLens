const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["citizen", "admin"],
      default: "citizen",
    },

    // Email verification (OTP sent over SMTP)
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCodeHash: {
      type: String,
      select: false,
    },

    verificationExpires: {
      type: Date,
      select: false,
    },

    verificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    verificationSentAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;