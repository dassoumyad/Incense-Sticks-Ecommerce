const transporter = require("./Nodemailer");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

const sendContactNotification = async ({ name, email, mobileNumber, message, createdAt }) => {
  const recipient = process.env.CONTACT_EMAIL || "sd83580@gmail.com";
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMobile = escapeHtml(mobileNumber);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  return transporter.sendMail({
    from: `"Serein Website" <${process.env.SMTP_USER}>`,
    to: recipient,
    replyTo: { name, address: email },
    subject: `New website contact message from ${name}`,
    text: `New contact form message\n\nName: ${name}\nEmail: ${email}\nMobile: ${mobileNumber}\nReceived: ${new Date(createdAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\nMessage:\n${message}`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f3ed;font-family:Arial,sans-serif;color:#3c3e33;"><main style="max-width:620px;margin:32px auto;padding:30px;background:#fff;"><p style="font-size:11px;letter-spacing:1px;color:#82836a;">SEREIN WEBSITE</p><h1 style="font-family:Georgia,serif;font-weight:400;">New contact message</h1><p><b>Name:</b> ${safeName}<br><b>Email:</b> <a href="mailto:${safeEmail}">${safeEmail}</a><br><b>Mobile:</b> ${safeMobile}</p><p style="color:#77766b;font-size:12px;">Received ${escapeHtml(new Date(createdAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}</p><section style="margin-top:24px;padding:18px;background:#f5f3ed;line-height:1.7;">${safeMessage}</section></main></body></html>`,
  });
};

module.exports = sendContactNotification;
