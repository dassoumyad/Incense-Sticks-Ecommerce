const AdminModel = require("../models/admin");
const verifyAdminToken = require("./verifyAdminToken");
const crypto = require("crypto");

// Allow public bootstrapping of the first admin only. Further admin accounts
// can be registered only by a signed-in admin.
const adminSignupAccess = async (req, res, next) => {
  try {
    const hasAdmin = await AdminModel.exists({});
    if (!hasAdmin) {
      const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET || "";
      if (!expectedSecret && process.env.NODE_ENV === "production") {
        return res.status(503).json({
          message: "Initial admin setup is disabled until the deployment setup code is configured.",
          success: false,
        });
      }
      if (expectedSecret) {
        const providedSecret = String(req.body?.adminSignupSecret || "");
        const expected = Buffer.from(expectedSecret);
        const provided = Buffer.from(providedSecret);
        const matches = expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
        if (!matches) {
          return res.status(403).json({
            message: "Enter the initial admin setup code from the deployment settings.",
            success: false,
          });
        }
      }
      return next();
    }
    if (!req.headers.token) {
      return res.status(403).json({
        message: "For security, sign in with an existing admin account to authorize another admin registration. Customer accounts cannot create admin accounts.",
        success: false,
      });
    }
    return verifyAdminToken(req, res, next);
  } catch (error) {
    return res.status(500).json({ message: "Could not verify admin signup access.", success: false });
  }
};

module.exports = adminSignupAccess;
