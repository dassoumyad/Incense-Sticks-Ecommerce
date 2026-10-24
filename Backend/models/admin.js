const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    mobileNumber: {
      type: String,
      required: true,
      unique: true
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    payoutDetails: {
      method: { type: String, enum: ["upi", "bank"], required: true },
      upiId: { type: String, trim: true, default: "" },
      accountHolderName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      ifscCode: { type: String, trim: true, uppercase: true, default: "" },
    },

    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const AdminModel = mongoose.model("is_admin_info", adminSchema);

module.exports = AdminModel;
