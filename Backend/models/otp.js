const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        otp: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            enum: ["signup", "password-reset"],
            default: "signup",
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const OTPModel = mongoose.model(
    "is_otp_info",
    otpSchema
);

module.exports = OTPModel;
