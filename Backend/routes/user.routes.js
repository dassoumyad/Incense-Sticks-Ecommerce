const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createNewUser,
  generateOtpUser,
  loginUser,
  requestPasswordResetOtp,
  resetPassword,
  changePassword,
} = require("../controllers/user.controllers");
const verify_token = require("../middleware/verifyToken");

// create new user (needs a valid otp)
router.post(
  "/create-new-user",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("otp")
      .isNumeric()
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("password").isStrongPassword().withMessage("Password must be strong"),
    body("confirm_password").notEmpty().withMessage("Confirm password is required"),
  ],
  createNewUser
);

// send otp to email
router.post(
  "/generate-otp-user",
  [body("email").isEmail().withMessage("Enter a valid email")],
  generateOtpUser
);

// user login
router.post(
  "/login-user",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

router.post(
  "/request-password-reset-otp",
  [body("email").isEmail().withMessage("Enter a valid email")],
  requestPasswordResetOtp
);

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("Reset code must be 6 digits"),
    body("password").isStrongPassword().withMessage("Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol"),
    body("confirm_password").notEmpty().withMessage("Confirm password is required"),
  ],
  resetPassword
);

router.post(
  "/change-password",
  verify_token,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("password").isStrongPassword().withMessage("Password must be at least 8 characters and include uppercase, lowercase, a number, and a symbol"),
    body("confirm_password").notEmpty().withMessage("Confirm password is required"),
  ],
  changePassword
);

module.exports = router;
