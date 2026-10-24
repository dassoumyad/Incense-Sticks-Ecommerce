const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    login_history: [
      {
        type: Date
      }
    ]
  },

  {
    timestamps: true
  }
);

const UserModel = mongoose.model("is_user_info", userSchema);

module.exports = UserModel;