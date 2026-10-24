const AdminModel = require("../models/admin");
const verifyAdminToken = require("./verifyAdminToken");

// Allow public bootstrapping of the first admin only. Further admin accounts
// can be registered only by a signed-in admin.
const adminSignupAccess = async (req, res, next) => {
  try {
    const hasAdmin = await AdminModel.exists({});
    if (!hasAdmin) return next();
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
