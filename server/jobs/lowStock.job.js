const cron = require("node-cron");
const Product = require("../models/Product.model");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

cron.schedule("*/5 * * * *", async () => {
  try {
    const lowStock = await Product.find({ quantity: { $lt: 5 } });

    if (lowStock.length > 0) {
      const list = lowStock.map(p => `• ${p.name} (Qty: ${p.quantity})`).join("\n");

      await transporter.sendMail({
        from: `"Inventory System" <${process.env.MAIL_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "⚠️ Low Stock Alert",
        text: `The following products are low on stock:\n\n${list}`,
      });

      console.log(`📧 Email sent: ${lowStock.length} low-stock items`);
    } else {
      console.log("✅ All stock levels okay");
    }

  } catch (err) {
    console.error("Low stock cron error:", err);
  }
});
