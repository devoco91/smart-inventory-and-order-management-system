// /routes/product.routes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product.model");
const csv = require("csv-parser");
const stream = require("stream");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

/* -------------------- CSV IMPORT -------------------- */
router.post("/import-csv", upload.single("file"), async (req, res) => {
  try {
    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (data) => {
        if (data.name && data.sku && data.quantity && data.category) {
          results.push({
            name: data.name,
            sku: data.sku.toUpperCase(),
            quantity: Number(data.quantity) || 0,
            category: data.category,
          });
        }
      })
      .on("end", async () => {
        await Product.insertMany(results);
        res.json({ message: "CSV import complete", count: results.length });
      });
  } catch (err) {
    console.error("CSV import error:", err);
    res.status(500).json({ error: "Failed to import CSV" });
  }
});

/* -------------------- GET ALL PRODUCTS -------------------- */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();

    // Convert image binary -> Base64 string for frontend
    const formatted = products.map((p) => ({
      ...p.toObject(),
      image: p.image?.data
        ? `data:${p.image.contentType};base64,${p.image.data.toString("base64")}`
        : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET /products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

/* -------------------- CREATE PRODUCT -------------------- */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, sku, quantity, category, image } = req.body;

    const newProduct = new Product({
      name,
      sku,
      quantity,
      category,
    });

    // Handle image from either Base64 string or uploaded file
    if (image && image.startsWith("data:image")) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        newProduct.image = {
          data: Buffer.from(matches[2], "base64"),
          contentType: matches[1],
        };
      }
    } else if (req.file) {
      newProduct.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await newProduct.save();

    res.status(201).json({
      ...newProduct.toObject(),
      image: newProduct.image?.data
        ? `data:${newProduct.image.contentType};base64,${newProduct.image.data.toString("base64")}`
        : null,
    });
  } catch (err) {
    console.error("POST /products error:", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

/* -------------------- UPDATE PRODUCT -------------------- */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, sku, quantity, category, image } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    product.name = name;
    product.sku = sku;
    product.quantity = quantity;
    product.category = category;

    if (image && image.startsWith("data:image")) {
      const matches = image.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        product.image = {
          data: Buffer.from(matches[2], "base64"),
          contentType: matches[1],
        };
      }
    } else if (req.file) {
      product.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    await product.save();

    res.json({
      ...product.toObject(),
      image: product.image?.data
        ? `data:${product.image.contentType};base64,${product.image.data.toString("base64")}`
        : null,
    });
  } catch (err) {
    console.error("PUT /products/:id error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

/* -------------------- DELETE PRODUCT -------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.sendStatus(204);
  } catch (err) {
    console.error("DELETE /products/:id error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

module.exports = router;
