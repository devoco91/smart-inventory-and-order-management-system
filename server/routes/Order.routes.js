// /server/routes/order.routes.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order.model");

// GET all orders with optional pagination
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("customer", "name email");

    const total = await Order.countDocuments();

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("GET /orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// CREATE order
router.post("/", async (req, res) => {
  const { customer, date, status, total, items } = req.body;
  if (!customer || !date || !status || total == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newOrder = new Order({ customer, status, total, items: items || [] });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("POST /orders error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// UPDATE order
router.put("/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /orders/:id error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Order not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /orders/:id error:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
