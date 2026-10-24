const jwt = require("jsonwebtoken");
const AdminModel = require("../models/admin");

const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ message: "Admin sign in is required.", success: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === "customer") {
      return res.status(403).json({ message: "Customer accounts cannot access admin features.", success: false });
    }

    const admin = await AdminModel.findById(decoded.id).select("_id email name");
    if (!admin) {
      return res.status(403).json({ message: "Admin access is required.", success: false });
    }

    req.token = decoded;
    req.admin = admin;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === "TokenExpiredError" ? "Admin session expired. Sign in again." : "Invalid admin session.",
      success: false,
    });
  }
};

module.exports = verifyAdminToken;
