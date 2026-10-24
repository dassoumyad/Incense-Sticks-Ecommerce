const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { createNewAdmin, adminLogin } = require("../controllers/admin.controllers");
const adminSignupAccess = require("../middleware/adminSignupAccess");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const { getAdminOrders } = require("../controllers/order.controllers");

router.get("/orders", verifyAdminToken, getAdminOrders);

router.post(
  "/create-new-admin",
  adminSignupAccess,
  [
    body("name").notEmpty().withMessage("Name is required"),

    body("storeName").notEmpty().withMessage("Store name is required"),

    body("email").isEmail().withMessage("Enter a valid email"),

    body("mobileNumber").notEmpty().withMessage("Mobile number is required"),

    body("payoutMethod").isIn(["upi", "bank"]).withMessage("Choose UPI or bank transfer"),

    body("password").isStrongPassword().withMessage("Password must be strong"),

    body("confirm_password").notEmpty().withMessage("Confirm password is required"),
  ],
  createNewAdmin
);

router.post(
  "/admin-login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),

    body("password").notEmpty().withMessage("Password is required"),
  ],
  adminLogin
);

module.exports = router;
