const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendVerificationEmail } = require("../config/mailer");

const CODE_TTL_MS = 10 * 60 * 1000; // code valid for 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between emails
const MAX_ATTEMPTS = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const hashCode = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

// Create a fresh 6-digit code, store its hash and email it.
const issueVerificationCode = async (user) => {
  const code = String(crypto.randomInt(100000, 1000000));

  user.verificationCodeHash = hashCode(code);
  user.verificationExpires = new Date(Date.now() + CODE_TTL_MS);
  user.verificationAttempts = 0;
  user.verificationSentAt = new Date();
  await user.save();

  try {
    await sendVerificationEmail(user.email, user.name, code);
  } catch (mailError) {
    // Email failed: do not block the next attempt with the cooldown
    user.verificationSentAt = undefined;
    await user.save();
    throw mailError;
  }
};

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, email and password",
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail })
      .select("+verificationSentAt");

    if (existingUser && existingUser.isVerified) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let user = existingUser;

    if (user) {
      // Earlier signup was never verified: let the person start over.
      const sentAt = user.verificationSentAt?.getTime() || 0;
      if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
        return res.status(429).json({
          success: false,
          message: "Verification code was just sent. Please wait a minute and try again.",
        });
      }
      user.name = name.trim();
      user.password = hashedPassword;
    } else {
      user = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
      });
    }

    try {
      await issueVerificationCode(user);
    } catch (mailError) {
      console.error("Verification email error:", mailError.message);
      return res.status(502).json({
        success: false,
        message: "Could not send verification email. Check that the email address is correct and try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Verification code sent to your email",
      needsVerification: true,
      email: user.email,
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

// VERIFY EMAIL WITH OTP
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and verification code",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+verificationCodeHash +verificationExpires +verificationAttempts");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified. Please log in.",
        token: generateToken(user._id),
        user: publicUser(user),
      });
    }

    if (
      !user.verificationCodeHash ||
      !user.verificationExpires ||
      user.verificationExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code expired. Please request a new one.",
      });
    }

    if (user.verificationAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many wrong attempts. Please request a new code.",
      });
    }

    const submitted = Buffer.from(hashCode(String(code).trim()));
    const stored = Buffer.from(user.verificationCodeHash);

    const matches =
      submitted.length === stored.length &&
      crypto.timingSafeEqual(submitted, stored);

    if (!matches) {
      user.verificationAttempts += 1;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    user.isVerified = true;
    user.verificationCodeHash = undefined;
    user.verificationExpires = undefined;
    user.verificationAttempts = 0;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token: generateToken(user._id),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};

// RESEND VERIFICATION CODE
const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email",
      });
    }

    const user = await User.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+verificationSentAt");

    // Same response whether or not the account exists, so emails can't be probed.
    const genericResponse = {
      success: true,
      message: "If this account is waiting for verification, a new code has been sent.",
    };

    if (!user || user.isVerified) {
      return res.status(200).json(genericResponse);
    }

    const sentAt = user.verificationSentAt?.getTime() || 0;
    if (Date.now() - sentAt < RESEND_COOLDOWN_MS) {
      return res.status(429).json({
        success: false,
        message: "Please wait a minute before requesting another code.",
      });
    }

    try {
      await issueVerificationCode(user);
    } catch (mailError) {
      console.error("Resend email error:", mailError.message);
      return res.status(502).json({
        success: false,
        message: "Could not send verification email. Please try again later.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("Resend code error:", error);

    return res.status(500).json({
      success: false,
      message: "Could not resend code",
    });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid email and password",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: user.email,
        message: "Please verify your email before logging in.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// GET LOGGED-IN USER PROFILE
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: publicUser(req.user),
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
    });
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  resendCode,
  loginUser,
  getMe,
};