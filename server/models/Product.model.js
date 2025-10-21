// /models/Product.model.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    quantity: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true },
    image: {
      data: Buffer,         // store image binary data
      contentType: String,  // store image type (e.g., "image/png")
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
