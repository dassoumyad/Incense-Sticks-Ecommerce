const mongoose = require("mongoose");
const CartModel = require("../models/cart");
const UserModel = require("../models/user");
const ProductModel = require("../models/product");
const { validationResult } = require("express-validator");

const getAuthenticatedUser = async (req) => UserModel.findById(req.token.id);

const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const { productId } = req.body;
    const quantity = Number(req.body.quantity || 1);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be a positive whole number", success: false });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const product = await ProductModel.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found", success: false });

    const cartItem = await CartModel.findOne({ userId: user._id, "product.productId": product._id });
    const nextQuantity = (cartItem?.product.quantity || 0) + quantity;
    if (nextQuantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} available for ${product.title}`, success: false });
    }

    if (cartItem) {
      cartItem.product.quantity = nextQuantity;
      cartItem.product.product_title = product.title;
      cartItem.product.product_price = product.actualPrice;
      cartItem.product.product_image = product.images?.[0] || "";
      await cartItem.save();
    } else {
      await CartModel.create({
        userId: user._id,
        product: {
          productId: product._id,
          product_title: product.title,
          product_price: product.actualPrice,
          product_image: product.images?.[0] || "",
          quantity,
        },
      });
    }

    return res.status(200).json({ message: "Product added to cart successfully", success: true });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

const syncCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const items = req.body.items;
    if (!Array.isArray(items) || items.length > 50) {
      return res.status(400).json({ message: "Cart must contain between 0 and 50 items", success: false });
    }

    const quantities = new Map();
    for (const item of items) {
      const { productId } = item || {};
      const quantity = Number(item?.quantity);
      if (!mongoose.Types.ObjectId.isValid(productId) || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: "Each cart item needs a valid product and positive whole-number quantity", success: false });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
    }

    const replacement = [];
    for (const [productId, quantity] of quantities) {
      const product = await ProductModel.findById(productId);
      if (!product) return res.status(400).json({ message: "A cart product is no longer available", success: false });
      if (quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} available for ${product.title}`, success: false });
      }
      replacement.push({
        userId: user._id,
        product: {
          productId: product._id,
          product_title: product.title,
          product_price: product.actualPrice,
          product_image: product.images?.[0] || "",
          quantity,
        },
      });
    }

    await CartModel.deleteMany({ userId: user._id });
    if (replacement.length) await CartModel.insertMany(replacement);

    return res.status(200).json({ message: "Cart synchronized successfully", success: true, itemCount: replacement.length });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

const remove_from_cart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    const result = await CartModel.deleteOne({ userId: user._id, "product.productId": req.body.productId });
    if (!result.deletedCount) return res.status(404).json({ message: "Product not found in cart", success: false });
    return res.status(200).json({ message: "Product removed from cart successfully", success: true });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

module.exports = { addToCart, syncCart, remove_from_cart };
