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

const parseAddress = (value) => {
  if (Array.isArray(value)) return value.map(parseAddress);
  if (value && typeof value === "object") {
    return {
      email: value.address || value.email,
      ...(value.name ? { name: value.name } : {}),
    };
  }

  const address = String(value || "").trim();
  const namedAddress = address.match(/^(.*?)\s*<([^<>]+)>$/);
  if (namedAddress) {
    const name = namedAddress[1].replace(/^['\"]|['\"]$/g, "").trim();
    return { email: namedAddress[2].trim(), ...(name ? { name } : {}) };
  }
  return { email: address };
};

const emailTransporter = {
  async sendMail(message) {
    if (!process.env.BREVO_API_KEY) {
      return transporter.sendMail(message);
    }

    const parsedFrom = parseAddress(message.from);
    const senderEmail = process.env.EMAIL_FROM || parsedFrom.email;
    if (!senderEmail) {
      throw new Error("Set EMAIL_FROM to a verified sender address in Brevo.");
    }

    const payload = {
      sender: {
        email: senderEmail,
        name: process.env.EMAIL_FROM_NAME || parsedFrom.name || "Serein Incense",
      },
      to: parseAddress(message.to),
      subject: message.subject,
      ...(message.text ? { textContent: message.text } : {}),
      ...(message.html ? { htmlContent: message.html } : {}),
      ...(message.replyTo ? { replyTo: parseAddress(message.replyTo) } : {}),
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        `Brevo email API returned ${response.status}: ${result.message || result.code || "check the API key and verified sender"}`,
      );
    }

    return { messageId: result.messageId };
  },
};

module.exports = emailTransporter;

