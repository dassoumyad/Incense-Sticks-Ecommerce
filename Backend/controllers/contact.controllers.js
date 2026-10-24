const ContactModel = require("../models/contact");
const AdminModel = require("../models/admin");
const { validationResult } = require("express-validator");
const sendContactNotification = require("../services/contactNotification");

// customer sends a message (no login needed)
const createContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    const { name, email, mobileNumber, message } = req.body;

    const newContact = new ContactModel({
      name: name,
      email: email.toLowerCase(),
      mobileNumber: mobileNumber,
      message: message,
    });

    await newContact.save();

    try {
      await sendContactNotification(newContact);
    } catch (emailError) {
      console.error("Contact notification email could not be sent:", emailError.message);
      return res.status(502).json({
        message: "Your message was saved, but the email could not be delivered. Please try again later.",
        success: false,
      });
    }

    return res.status(200).json({ message: "Message sent successfully. We’ll reply by email soon.", success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


// admin sees all messages
const getAllContacts = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // check admin is valid
    const exist_admin = await AdminModel.findOne({ _id: req.token.id });
    if (!exist_admin) {
      return res.status(400).json({ message: "Invalid Authentication", success: false });
    }

    const skip = Number(req.body.skip) || 0;

    const data = await ContactModel.find().sort({ _id: -1 }).skip(skip).limit(100);

    return res.status(200).json({ message: "Messages fetched successfully", success: true, data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};


// admin deletes a message
const deleteContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, success: false });
    }

    // check admin is valid
    const exist_admin = await AdminModel.findOne({ _id: req.token.id });
    if (!exist_admin) {
      return res.status(400).json({ message: "Invalid Authentication", success: false });
    }

    const { _id } = req.body;

    const exist_contact = await ContactModel.findOne({ _id: _id });
    if (!exist_contact) {
      return res.status(404).json({ message: "Message not found", success: false });
    }

    await ContactModel.deleteOne({ _id: _id });

    return res.status(200).json({ message: "Message deleted successfully", success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

module.exports = { createContact, getAllContacts, deleteContact };
