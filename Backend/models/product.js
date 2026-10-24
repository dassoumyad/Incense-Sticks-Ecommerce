const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    brandName: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true
    },

    fragranceType: {
      type: String,
      required: true,
      trim: true
    },

    MRP: {
      type: Number,
      required: true
    },

    discount: {
      type: Number,
      default: 0
    },

    actualPrice: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      required: true,
      default: 0
    },

    description: {
      type: String,
      required: true
    },

    burningTime: {
      type: String,
      required: true
    },

    weight: {
      type: Number,
      required: true
    },

    material: {
      type: String,
      required: true
    },

    images: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// needed for text search
productSchema.index({
  title: "text",
  brandName: "text",
  category: "text",
  fragranceType: "text"
});

const ProductModel = mongoose.model("is_product_info", productSchema);

module.exports = ProductModel;