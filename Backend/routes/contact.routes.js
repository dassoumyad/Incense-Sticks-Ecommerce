const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const verifyAdminToken = require("../middleware/verifyAdminToken");
const {
  createContact,
  getAllContacts,
  deleteContact,
} = require("../controllers/contact.controllers");

// customer: send message
router.post(
  "/create-contact",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Enter a valid email"),
    body("mobileNumber").isMobilePhone("en-IN").withMessage("Enter a valid mobile number"),
    body("message")
      .notEmpty()
      .isLength({ max: 500 })
      .withMessage("Message is required (maximum 500 characters)"),
  ],
  createContact
);

// admin: see all messages
router.post(
  "/get-all-contacts",
  verifyAdminToken,
  [body("skip").optional().isInt({ min: 0 }).withMessage("Invalid skip value")],
  getAllContacts
);

// admin: delete a message
router.delete(
  "/delete-contact",
  verifyAdminToken,
  [body("_id").isMongoId().withMessage("Valid message id is required")],
  deleteContact
);

module.exports = router;
