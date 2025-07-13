// /server/routes/supplier.routes.js
const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier.model");

// GET all suppliers (with optional pagination)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const suppliers = await Supplier.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Supplier.countDocuments();
    res.json({
      suppliers,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("GET /suppliers error:", err);
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// CREATE supplier
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newSupplier = new Supplier(req.body);
    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (err) {
    console.error("POST /suppliers error:", err);
    res.status(500).json({ error: "Failed to create supplier" });
  }
});

// UPDATE supplier
router.put("/:id", async (req, res) => {
  try {
    const updated = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Supplier not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /suppliers/:id error:", err);
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// DELETE supplier
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Supplier not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /suppliers/:id error:", err);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

module.exports = router;
