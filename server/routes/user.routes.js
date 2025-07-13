// /server/routes/user.routes.js
const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const { verifyToken } = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/isAdmin");

// Get all users (Admin only)
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    res.json(users);
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user (Admin only)
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user (Admin only)
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /users/:id error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

module.exports = router;
