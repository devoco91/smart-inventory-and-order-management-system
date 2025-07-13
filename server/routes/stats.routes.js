const express = require("express");
const router = express.Router();
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

// GET /api/stats/summary
router.get("/summary", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const lowStockCount = await Product.countDocuments({ quantity: { $lt: 5 } });

    const recentSales = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ productCount, orderCount, lowStockCount, recentSales });
  } catch (err) {
    console.error("GET /stats/summary error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

module.exports = router;
