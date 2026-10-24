require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const connectDB = require("./db/db");

const AdminRoutes = require("./routes/admin.routes");
const CategoryRoutes = require("./routes/categoryroutes");
const ProductRoutes = require("./routes/product.routes");
const UserRoutes = require("./routes/user.routes");
const CartRoutes = require("./routes/cart.routers");
const UnusedCouponCodeRoutes = require("./routes/unusedCouponCode.routers");
const OrderRoutes = require("./routes/order.routes"); 
const ContactRoutes = require("./routes/contact.routes");
const ChatRoutes = require("./routes/chat.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/assets", express.static("statics"));

connectDB();

app.get("/health", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? "ok" : "starting",
    database: databaseConnected ? "connected" : "disconnected",
  });
});

// Routes
app.use("/api/admin", AdminRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/product", ProductRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/unused-coupon-code", UnusedCouponCodeRoutes);
app.use("/api/order", OrderRoutes);
app.use("/api/contact", ContactRoutes);
app.use("/api/chat", ChatRoutes);

// Serve the built storefront from the same public service in production.
const frontendDist = path.join(__dirname, "..", "Frontend", "dist");
app.use(express.static(frontendDist));
app.get(/.*/, (req, res, next) => {
  if (req.path === "/api" || req.path.startsWith("/api/") || req.path.startsWith("/assets/")) {
    return next();
  }
  res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next(error);
  });
});

const port = process.env.PORT || 8500;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});




