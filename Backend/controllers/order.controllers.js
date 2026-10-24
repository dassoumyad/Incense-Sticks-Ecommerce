const Razorpay = require("razorpay");
const { validatePaymentVerification } = require("razorpay/dist/utils/razorpay-utils");
const { validationResult } = require("express-validator");

const UserModel = require("../models/user");
const CartModel = require("../models/cart");
const ProductModel = require("../models/product");
const OrderModel = require("../models/order");
const UnusedModel = require("../models/unusedcode");
const UsedCodeModel = require("../models/usedcode");
const sendOrderReceipt = require("../services/orderReceipt");

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});


// STEP 1: customer clicks "Pay". We create the razorpay order.
const createUserOrder = async (req, res) => {
  try {
    // 1. check errors from the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // 2. check the user
    const exist_user = await UserModel.findOne({ _id: req.token.id });
    if (!exist_user) {
      return res.status(404).json({ message: "Invalid Authentication", success: false });
    }

    // 3. get the cart
    const cart_data = await CartModel.find({ userId: exist_user._id });
    if (cart_data.length === 0) {
      return res.status(400).json({ message: "Cart is empty", success: false });
    }

    // 4. add up the price of all products (price comes from the database)
    let total_amount = 0;

    for (const item of cart_data) {
      const product = await ProductModel.findById(item.product.productId);

      if (!product) {
        return res.status(400).json({ message: "A product is not available now", success: false });
      }
      if (item.product.quantity > product.stock) {
        return res.status(400).json({ message: "Not enough stock for " + product.title, success: false });
      }

      total_amount = total_amount + product.actualPrice * item.product.quantity;
    }

    // 5. coupon (only if the customer sent one)
    let final_discount = 0;

    if (req.body.couponCode) {
      const code = req.body.couponCode.toUpperCase();

      const exist_coupon = await UnusedModel.findOne({ name: code });
      if (!exist_coupon) {
        return res.status(404).json({ message: "Coupon code not found", success: false });
      }

      const already_used = await UsedCodeModel.findOne({ userId: exist_user._id, name: code });
      if (already_used) {
        return res.status(400).json({ message: "You already used this coupon code", success: false });
      }

      // discount in rupees, but never more than maxDiscount
      final_discount = (total_amount * exist_coupon.discount) / 100;
      if (final_discount > exist_coupon.maxDiscount) {
        final_discount = exist_coupon.maxDiscount;
      }
    }

    // 6. final amount to pay
    const final_amount = total_amount - final_discount;
    if (final_amount < 1) {
      return res.status(400).json({ message: "Order amount is too small", success: false });
    }

    // 7. create the razorpay order (razorpay wants paise, so multiply by 100)
    const create_order = await instance.orders.create({
      amount: Math.round(final_amount * 100),
      currency: "INR",
    });

    return res.status(200).json({
      message: "Order created successfully",
      success: true,
      cart_total: total_amount,
      discount: final_discount,
      final_amount: final_amount,
      create_order,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


// STEP 2: customer has paid. We check the payment and save the order.
const verifyUserOrder = async (req, res) => {
  try {
    // 1. check errors from the route
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // 2. check the user
    const exist_user = await UserModel.findOne({ _id: req.token.id });
    if (!exist_user) {
      return res.status(404).json({ message: "Invalid Authentication", success: false });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      mobileNumber,
      address,
      city,
      state,
      pincode,
      couponCode,
    } = req.body;

    // 3. check the payment is real
    const flag = validatePaymentVerification(
      { order_id: razorpay_order_id, payment_id: razorpay_payment_id },
      razorpay_signature,
      process.env.RAZORPAY_SECRET
    );
    if (!flag) {
      return res.status(400).json({ message: "Invalid Transaction", success: false });
    }

    // 4. same payment cannot make two orders
    const already_saved = await OrderModel.findOne({ razorpayPaymentId: razorpay_payment_id });
    if (already_saved) {
      return res.status(400).json({ message: "Order already placed", success: false });
    }

    // 5. get the cart
    const cart_data = await CartModel.find({ userId: exist_user._id });
    if (cart_data.length === 0) {
      return res.status(400).json({ message: "Cart is empty", success: false });
    }

    // 6. get the paid amount from razorpay (not from the customer)
    const razorpay_order = await instance.orders.fetch(razorpay_order_id);
    const total_amount = razorpay_order.amount / 100;
    let payment_method = "Online";
    try {
      const razorpay_payment = await instance.payments.fetch(razorpay_payment_id);
      payment_method = razorpay_payment.method || payment_method;
    } catch (paymentFetchError) {
      console.error("Could not fetch payment method:", paymentFetchError.message);
    }

    // 7. copy cart items into the order
    const order_details = [];

    for (const item of cart_data) {
      order_details.push({
        productId: item.product.productId,
        product_title: item.product.product_title,
        product_price: item.product.product_price,
        product_quantity: item.product.quantity,
        product_image: item.product.product_image,
      });
    }

    // 8. save the order
    const newOrder = new OrderModel({
      userId: exist_user._id,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: payment_method,
      currency: razorpay_order.currency || "INR",
      totalAmount: total_amount,
      billingAddress: {
        name: name,
        email: email,
        mobileNo: mobileNumber,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
      },
      orderDetails: order_details,
    });
    await newOrder.save();

    // 9. reduce the stock of each product
    for (const item of cart_data) {
      await ProductModel.updateOne(
        { _id: item.product.productId },
        { $inc: { stock: -item.product.quantity } }
      );
    }

    // 10. if a coupon was used, remember it
    if (couponCode) {
      const exist_coupon = await UnusedModel.findOne({ name: couponCode.toUpperCase() });

      if (exist_coupon) {
        await UsedCodeModel.create({
          userId: exist_user._id,
          name: exist_coupon.name,
          discount: exist_coupon.discount,
          maxDiscount: exist_coupon.maxDiscount,
        });
      }
    }

    // 11. empty the cart
    await CartModel.deleteMany({ userId: exist_user._id });

    // Email is best-effort: a mail failure must not turn a verified payment into a failed order.
    try {
      await sendOrderReceipt(newOrder, exist_user.email);
      newOrder.receiptEmailSentAt = new Date();
      await newOrder.save();
    } catch (emailError) {
      console.error("Order receipt email could not be sent:", emailError.message);
    }

    return res.status(200).json({ message: "Payment Successful", success: true, orderId: newOrder._id, receiptEmailSent: Boolean(newOrder.receiptEmailSentAt) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const user = await UserModel.findById(req.token.id);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const orders = await OrderModel.find({ userId: user._id })
      .select("-razorpaySignature")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return res.status(500).json({ message: "Could not load your orders", success: false });
  }
};

// Only verified payments are saved as orders, so this list is the store's paid-order history.
const getAdminOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .select("-razorpaySignature")
      .sort({ createdAt: -1 })
      .lean();
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      totalRevenue,
      orders,
    });
  } catch (err) {
    console.error("Could not load admin orders:", err.message);
    return res.status(500).json({ message: "Could not load store orders", success: false });
  }
};

const resendOrderReceipt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const user = await UserModel.findById(req.token.id);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const order = await OrderModel.findOne({ _id: req.body.orderId, userId: user._id });
    if (!order) return res.status(404).json({ message: "Order not found", success: false });

    await sendOrderReceipt(order, user.email);
    order.receiptEmailSentAt = new Date();
    await order.save();
    return res.status(200).json({ message: `Receipt sent to ${user.email}`, success: true, receiptEmailSentAt: order.receiptEmailSentAt });
  } catch (err) {
    console.error("Order receipt resend failed:", err.message);
    return res.status(502).json({ message: "The receipt could not be sent. Check the backend email configuration and try again.", success: false });
  }
};

module.exports = { createUserOrder, verifyUserOrder, getUserOrders, getAdminOrders, resendOrderReceipt };
