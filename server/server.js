// /server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { verifyToken } = require("./middleware/auth.middleware");
const { isAdmin } = require("./middleware/isAdmin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images (uploads)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const customerRoutes = require("./routes/customer.routes");
const supplierRoutes = require("./routes/supplier.routes");
const orderRoutes = require("./routes/order.routes");         // ✅ Valid, no issue
const statsRoutes = require("./routes/stats.routes");

// Public (no token required)
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/products", verifyToken, productRoutes);
app.use("/api/customers", verifyToken, customerRoutes);
app.use("/api/suppliers", verifyToken, supplierRoutes);
app.use("/api/orders", verifyToken, orderRoutes);
app.use("/api/stats", verifyToken, statsRoutes);

// Admin-only routes
app.use("/api/users", verifyToken, isAdmin, userRoutes);

// Cron jobs
require("./jobs/lowStock.job");

// Connect and start
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Auto-seed admin
    const User = require("./models/User.model");
    const existingAdmin = await User.findOne({ email: "admin" });
    if (!existingAdmin) {
      const admin = new User({
        name: "Admin",
        email: "admin",
        password: "adminpass",
        role: "admin",
      });
      await admin.save();
      console.log("✅ Admin user seeded: admin / adminpass");
    }

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
