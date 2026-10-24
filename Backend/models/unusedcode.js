const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true // fixed
    },

    discount: {
      type: Number,
      required: true
    },

    maxDiscount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const UnusedCode = mongoose.model("is_unused_code", couponSchema);

module.exports = UnusedCode;