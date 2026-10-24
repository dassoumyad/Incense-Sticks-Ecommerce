const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "is_user_info",
      required: true,
    },

    razorpayPaymentId: { type: String, required: true, unique: true }, // one payment = one order
    razorpayOrderId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    paymentMethod: { type: String, default: "Online" },
    currency: { type: String, default: "INR" },
    receiptEmailSentAt: { type: Date, default: null },

    totalAmount: { type: Number, required: true },

    billingAddress: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      mobileNo: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },

    orderDetails: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "is_product_info",
          required: true,
        },
        product_title: { type: String, required: true },
        product_price: { type: Number, required: true },
        product_quantity: { type: Number, required: true }, // fixed spelling
        product_image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const OrderModel = mongoose.model("is_order_info", orderSchema);

module.exports = OrderModel;
