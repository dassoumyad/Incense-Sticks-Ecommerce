const nodemailer = require("nodemailer");
const dns = require("node:dns");

// Render currently cannot reach Gmail's IPv6 SMTP endpoint. Prefer IPv4 so
// Node selects Gmail's reachable IPv4 address when opening the SMTP socket.
dns.setDefaultResultOrder("ipv4first");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
module.exports = transporter;

