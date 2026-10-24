const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const verifyToken = require("../middleware/verifyToken");
const { createUserOrder, verifyUserOrder, getUserOrders, resendOrderReceipt } = require("../controllers/order.controllers");

router.get("/get-user-orders", verifyToken, getUserOrders);
router.post("/resend-order-receipt", verifyToken, [body("orderId").isMongoId().withMessage("Valid order id is required")], resendOrderReceipt);

// step 1: create razorpay order
router.post(
  "/create-user-order",
  verifyToken,
  [body("couponCode").optional().isString().withMessage("Invalid coupon code")],
  createUserOrder
);

// step 2: verify payment and save order
router.post(
  "/verify-user-order",
  verifyToken,
  [
    body("razorpay_order_id").isString().withMessage("Invalid razorpay_order_id"),
    body("razorpay_payment_id").isString().withMessage("Invalid razorpay_payment_id"),
    body("razorpay_signature").isString().withMessage("Invalid razorpay_signature"),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("mobileNumber").isMobilePhone("en-IN").withMessage("Invalid mobile number"),
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode").isNumeric().isLength({ min: 6, max: 6 }).withMessage("Pincode must be 6 digits"),
    body("couponCode").optional().isString().withMessage("Invalid coupon code"),
  ],
  verifyUserOrder
);

module.exports = router;
