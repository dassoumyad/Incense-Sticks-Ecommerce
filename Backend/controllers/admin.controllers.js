const AdminModel = require("../models/admin");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// create new admin
const createNewAdmin = async (req, res) => {
  try {
    // check validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      storeName,
      mobileNumber,
      password,
      confirm_password,
      payoutMethod,
      upiId,
      accountHolderName,
      accountNumber,
      ifscCode,
    } = req.body;
    const email = req.body.email.trim().toLowerCase();
    const normalizedMobile = mobileNumber.trim();

    if (payoutMethod === "upi" && !/^[\w.-]+@[\w.-]+$/.test((upiId || "").trim())) {
      return res.status(400).json({ success: false, message: "Enter a valid UPI ID." });
    }
    if (payoutMethod === "bank") {
      if (!accountHolderName?.trim() || !/^\d{8,18}$/.test(accountNumber || "")) {
        return res.status(400).json({ success: false, message: "Enter the account holder name and a valid bank account number." });
      }
      if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifscCode || "")) {
        return res.status(400).json({ success: false, message: "Enter a valid 11-character IFSC code." });
      }
    }
    if (!["upi", "bank"].includes(payoutMethod)) {
      return res.status(400).json({ success: false, message: "Choose UPI or bank transfer for payouts." });
    }

    const exist_email = await AdminModel.findOne({ email });
    if (exist_email) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const mobileNumberExists = await AdminModel.findOne({ mobileNumber: normalizedMobile });
    if (mobileNumberExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists",
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // hash the password and save
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new AdminModel({
      name: name,
      email: email,
      mobileNumber: normalizedMobile,
      storeName: storeName.trim(),
      payoutDetails: {
        method: payoutMethod,
        upiId: payoutMethod === "upi" ? upiId.trim() : "",
        accountHolderName: payoutMethod === "bank" ? accountHolderName.trim() : "",
        accountNumber: payoutMethod === "bank" ? accountNumber.trim() : "",
        ifscCode: payoutMethod === "bank" ? ifscCode.trim().toUpperCase() : "",
      },
      password: hashedPassword,
    });

    await newAdmin.save();

    const token = jwt.sign(
      { id: newAdmin._id, email: newAdmin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        mobileNumber: newAdmin.mobileNumber,
        storeName: newAdmin.storeName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// admin login
const adminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { password } = req.body;
    const email = req.body.email.trim().toLowerCase();

    // check admin exists
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // create token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        mobileNumber: admin.mobileNumber,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { createNewAdmin, adminLogin };
