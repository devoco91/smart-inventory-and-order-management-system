// /server/routes/auth.routes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { verifyToken } = require("../middleware/auth.middleware");
const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    console.error("POST /auth/register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// GET CURRENT USER (/me)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;
