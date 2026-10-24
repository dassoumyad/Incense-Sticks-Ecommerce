const crypto = require("crypto");
const transporter = require("../services/Nodemailer");
const OTPModel = require("../models/otp");

// email design
const getOtpEmailHtml = (otp, purpose) => {
  const isPasswordReset = purpose === "password-reset";
  const heading = isPasswordReset ? "Reset your password" : "Verify your email";
  const explanation = isPasswordReset
    ? "Use this code to reset your InSensic account password."
    : "Thank you for choosing InSensic. Please use the code below to verify your email address and complete your signup.";
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0; padding:0; background-color:#f3efe9; font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3efe9; padding:30px 15px;">
      <tr>
        <td align="center">

          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border-radius:10px; overflow:hidden;">

            <!-- header -->
            <tr>
              <td align="center" style="background-color:#5a3a22; padding:28px 20px;">
                <h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:2px;">InSensic</h1>
                <p style="margin:6px 0 0; color:#e8d5c0; font-size:13px;">Pure &amp; Natural Incense Sticks</p>
              </td>
            </tr>

            <!-- body -->
            <tr>
              <td style="padding:35px 30px 10px;">
                <h2 style="margin:0 0 12px; color:#2b2b2b; font-size:20px;">${heading}</h2>
                <p style="margin:0; color:#555555; font-size:15px; line-height:1.6;">
                  ${explanation}
                </p>
              </td>
            </tr>

            <!-- otp box -->
            <tr>
              <td align="center" style="padding:20px 30px;">
                <div style="background-color:#faf5ee; border:1px dashed #c9a27a; border-radius:8px; padding:22px 10px;">
                  <span style="font-size:36px; font-weight:bold; letter-spacing:10px; color:#5a3a22;">${otp}</span>
                </div>
              </td>
            </tr>

            <!-- info -->
            <tr>
              <td style="padding:0 30px 30px;">
                <p style="margin:0 0 10px; color:#555555; font-size:14px;">
                  This code is valid for <strong>10 minutes</strong>.
                </p>
                <p style="margin:0; color:#888888; font-size:13px; line-height:1.6;">
                  If you did not request this code, you can safely ignore this email.
                  For your safety, never share this code with anyone.
                </p>
              </td>
            </tr>

            <!-- footer -->
            <tr>
              <td align="center" style="background-color:#faf5ee; padding:18px 20px; border-top:1px solid #eee3d6;">
                <p style="margin:0; color:#999999; font-size:12px;">
                  &copy; ${new Date().getFullYear()} InSensic - Incense Sticks E-Commerce
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};


const generateOTP = async (email, purpose = "signup") => {
  try {
    // 6 digit random otp
    const otp = crypto.randomInt(100000, 1000000).toString();

    // valid for 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // remove old otps of this email, then save the new one
    await OTPModel.deleteMany({ email, purpose });
    await OTPModel.create({ email, otp, purpose, expiresAt });

    // send the email
    const info = await transporter.sendMail({
      from: `"InSensic" <${process.env.SMTP_USER}>`,
      to: email,
      subject: purpose === "password-reset" ? "Reset your InSensic password" : "Your InSensic verification code",
      text: `Your InSensic ${purpose === "password-reset" ? "password reset" : "verification"} code is ${otp}. It is valid for 10 minutes.`,
      html: getOtpEmailHtml(otp, purpose),
    });

    console.log("OTP email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = generateOTP;
