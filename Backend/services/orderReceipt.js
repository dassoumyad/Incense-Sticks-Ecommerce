const transporter = require("./Nodemailer");

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}[char]));

const formatPrice = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const sendOrderReceipt = async (order, recipientEmail) => {
  const customerName = escapeHtml(order.billingAddress?.name || "there");
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const rows = (order.orderDetails || []).map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e9e6dc;color:#3c3e33;">${escapeHtml(item.product_title)}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e9e6dc;text-align:center;color:#77766b;">${Number(item.product_quantity) || 0}</td>
      <td style="padding:12px 0;border-bottom:1px solid #e9e6dc;text-align:right;color:#3c3e33;">${formatPrice((Number(item.product_price) || 0) * (Number(item.product_quantity) || 0))}</td>
    </tr>`).join("");

  const amount = formatPrice(order.totalAmount);
  const paymentId = escapeHtml(order.razorpayPaymentId);
  const razorpayOrderId = escapeHtml(order.razorpayOrderId);
  const paymentMethod = escapeHtml(order.paymentMethod || "Online");
  const address = order.billingAddress || {};
  const shippingAddress = [address.address, address.city, address.state, address.pincode]
    .filter(Boolean).map(escapeHtml).join(", ");

  return transporter.sendMail({
    from: `"Serein Incense" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `Your Serein order receipt — ${amount}`,
    text: `Thank you for your order, ${order.billingAddress?.name || ""}.\n\n${(order.orderDetails || []).map((item) => `${item.product_title} × ${item.product_quantity} — ${formatPrice(item.product_price * item.product_quantity)}`).join("\n")}\n\nTotal paid: ${amount}\nDate: ${orderDate}\nPayment method: ${order.paymentMethod || "Online"}\nPayment ID: ${order.razorpayPaymentId}\nOrder ID: ${order.razorpayOrderId}\n\nDelivery address: ${shippingAddress}`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f3ed;font-family:Arial,sans-serif;color:#3c3e33;"><div style="max-width:620px;margin:32px auto;padding:0 14px;"><div style="background:#363a2e;padding:26px;text-align:center;color:#fff;"><div style="font-family:Georgia,serif;font-size:30px;">Serein</div><div style="margin-top:5px;color:#d7d2bd;font-size:11px;letter-spacing:2px;">RITUALS FOR SLOW LIVING</div></div><div style="background:#fff;padding:30px;"><p style="font-size:12px;letter-spacing:1px;color:#82836a;">ORDER CONFIRMED</p><h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;">Thank you, ${customerName}.</h1><p style="color:#77766b;font-size:14px;line-height:1.7;">Your order is confirmed. We hope it brings a little calm to your day.</p><p style="font-size:12px;color:#77766b;">Placed ${escapeHtml(orderDate)}</p><table style="width:100%;border-collapse:collapse;font-size:13px;"><thead><tr><th style="padding:10px 0;text-align:left;color:#89877c;font-weight:400;">ITEM</th><th style="padding:10px 0;color:#89877c;font-weight:400;">QTY</th><th style="padding:10px 0;text-align:right;color:#89877c;font-weight:400;">TOTAL</th></tr></thead><tbody>${rows}</tbody></table><div style="display:flex;justify-content:space-between;padding:18px 0;border-bottom:1px solid #e9e6dc;font-size:16px;"><span>Total paid</span><strong>${amount}</strong></div><h2 style="margin:26px 0 12px;font-family:Georgia,serif;font-size:20px;font-weight:400;">Payment details</h2><p style="font-size:12px;line-height:1.8;color:#77766b;">Method: ${paymentMethod}<br>Payment ID: ${paymentId}<br>Razorpay order ID: ${razorpayOrderId}</p><h2 style="margin:24px 0 10px;font-family:Georgia,serif;font-size:20px;font-weight:400;">Delivering to</h2><p style="font-size:12px;line-height:1.7;color:#77766b;">${escapeHtml(address.name || "")}<br>${escapeHtml(shippingAddress)}<br>${escapeHtml(address.mobileNo || "")}</p></div><div style="padding:18px;text-align:center;color:#89877c;font-size:11px;">With care, Serein Incense · ${new Date().getFullYear()}</div></div></body></html>`,
  });
};

module.exports = sendOrderReceipt;
