import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  if (user) {
    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  console.log("1. Entered loginUser function.");
  const { email, password } = req.body;

  console.log(`2. Attempting to find user with email: ${email}`);
  const user = await User.findOne({ email });
  console.log("3. User.findOne completed.");

  if (user) {
    console.log("4. User found. Comparing password...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("5. Password comparison completed.");

    if (isMatch) {
      console.log("6. Passwords match. Generating token...");
      const token = generateToken(user._id);
      console.log("7. Token generated.");

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      console.log("8. Cookie set.");

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
      });
      console.log("9. JSON response sent.");
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export { registerUser, loginUser, getMe };
