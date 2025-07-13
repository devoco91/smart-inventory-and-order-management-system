// /server/routes/customer.routes.js
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer.model");

// GET customers with pagination, search and sorting
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = req.query.search || "";
  const sortField = req.query.sort || "createdAt";
  const sortOrder = req.query.order === "desc" ? -1 : 1;

  try {
    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    };

    const totalCount = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.json({
      customers,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error("GET /customers error:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// CREATE customer
router.post("/", async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const existing = await Customer.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: "Email or phone already exists" });
    }

    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    console.error("POST /customers error:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// UPDATE customer
router.put("/:id", async (req, res) => {
  try {
    const existing = await Customer.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(400).json({ error: "Email or phone already in use" });
    }

    const updated = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Customer not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /customers/:id error:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// DELETE customer
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Customer not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /customers/:id error:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
