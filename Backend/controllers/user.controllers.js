const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const OTPModel = require("../models/otp");
const generateOTP = require("../services/generateOTP");

// create new user (needs a valid otp)
const createNewUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const { otp, password, confirm_password } = req.body;
    const email = req.body.email.toLowerCase();

    // check user already exists
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    // check both passwords are same
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match", success: false });
    }

    // find the latest otp of this email
    const existingOtp = await OTPModel.findOne({ email: email, purpose: "signup" }).sort({ _id: -1 });
    if (!existingOtp) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // otp expires in 10 minutes
    if (!existingOtp.expiresAt || existingOtp.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired", success: false });
    }

    // check the otp is correct
    if (existingOtp.otp !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      login_history: [new Date()],
    });

    // otp is used, so delete it
    await OTPModel.deleteMany({ email: email, purpose: "signup" });

    res.status(200).json({ message: "User created successfully", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// send otp to email
const generateOtpUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const email = req.body.email.toLowerCase();

    // do not send otp if the user already exists
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", success: false });
    }

    const isSent = await generateOTP(email);
    if (!isSent) {
      return res.status(500).json({ message: "Could not send OTP. Try again", success: false });
    }

    res.status(200).json({ message: "OTP sent to your email", success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// user login
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    // check user exists
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // check password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }

    // save login time
    existingUser.login_history.push(new Date());
    await existingUser.save();

    // create token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      success: true,
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const requestPasswordResetOtp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const email = req.body.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account was found with that email address.", success: false });
    }

    const isSent = await generateOTP(email, "password-reset");
    if (!isSent) {
      return res.status(500).json({ message: "Could not send the reset code. Please try again.", success: false });
    }

    return res.status(200).json({ message: "Password reset code sent to your email.", success: true });
  } catch (err) {
    console.error("Password reset OTP error:", err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const email = req.body.email.trim().toLowerCase();
    const { otp, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match.", success: false });
    }

    const existingOtp = await OTPModel.findOne({ email, purpose: "password-reset" }).sort({ _id: -1 });
    if (!existingOtp || existingOtp.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid reset code.", success: false });
    }
    if (!existingOtp.expiresAt || existingOtp.expiresAt < new Date()) {
      await OTPModel.deleteMany({ email, purpose: "password-reset" });
      return res.status(400).json({ message: "Reset code has expired. Request a new one.", success: false });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account not found.", success: false });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    await OTPModel.deleteMany({ email, purpose: "password-reset" });
    return res.status(200).json({ message: "Password reset successfully. You can now sign in.", success: true });
  } catch (err) {
    console.error("Password reset error:", err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const { currentPassword, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      return res.status(400).json({ message: "New passwords do not match.", success: false });
    }

    const user = await UserModel.findById(req.token.id);
    if (!user) {
      return res.status(404).json({ message: "Account not found.", success: false });
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(400).json({ message: "Current password is incorrect.", success: false });
    }
    if (await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: "Choose a password different from your current one.", success: false });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    return res.status(200).json({ message: "Password changed successfully.", success: true });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = { createNewUser, generateOtpUser, loginUser, requestPasswordResetOtp, resetPassword, changePassword };
