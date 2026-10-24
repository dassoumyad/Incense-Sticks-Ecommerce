require("dotenv").config();

const express = require("express");
const cors = require("cors");

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


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});




