// /routes/product.routes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product.model");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");

// Storage setup
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload image separately (optional endpoint)
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ imagePath: `/uploads/${req.file.filename}` });
});

// Import CSV products
router.post("/import-csv", upload.single("file"), async (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      if (data.name && data.sku && data.quantity && data.category) {
        results.push(data);
      }
    })
    .on("end", async () => {
      try {
        await Product.insertMany(results);
        res.json({ message: "CSV import complete", count: results.length });
      } catch (err) {
        console.error("CSV import error:", err);
        res.status(500).json({ error: "Failed to import CSV" });
      }
    });
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// CREATE product (with optional image)
router.post("/", upload.single("image"), async (req, res) => {
  const { name, sku, quantity, category } = req.body;
  if (!name || !sku || quantity == null || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newProduct = new Product({
      name,
      sku,
      quantity,
      category,
      image: req.file?.filename,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// UPDATE product (with optional image)
router.put("/:id", upload.single("image"), async (req, res) => {
  const { name, sku, quantity, category } = req.body;

  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const updatedData = { name, sku, quantity, category };

    // Handle image replacement
    if (req.file) {
      if (existing.image) {
        fs.unlink(path.join("uploads", existing.image), (err) =>
          err && console.warn("Image delete failed:", err)
        );
      }
      updatedData.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    // Delete associated image
    if (deleted.image) {
      fs.unlink(path.join("uploads", deleted.image), (err) =>
        err && console.warn("Image delete failed:", err)
      );
    }

    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
