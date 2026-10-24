const mongoose = require("mongoose");

const usedCouponSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "is_user_info",
      required: true
    },

    name: {
      type: String,
      required: true,
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

const UsedCouponModel = mongoose.model("is_used_code", usedCouponSchema);

module.exports = UsedCouponModel;