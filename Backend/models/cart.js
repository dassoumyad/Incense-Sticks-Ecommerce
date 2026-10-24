const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "is_user_info",
      required: true
    },

    product: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "is_product_info",
        required: true
      },
      product_title: {
        type: String,
        required: true
      },
      product_price: {
        type: Number,
        required: true
      },
      product_image: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  },
  {
    timestamps: true
  }
);

const CartModel = mongoose.model("is_cart_info", cartSchema);

module.exports = CartModel;