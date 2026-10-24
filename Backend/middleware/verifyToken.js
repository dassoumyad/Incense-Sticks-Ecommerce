const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const verify_token = async (req, res, next) => {
    try {
        const token = req.headers.token;

        if (!token) {
            return res.status(401).json({
                message: "Please sign in to continue.",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token.", success: false });
        }
        if (decoded.role === "admin") {
            return res.status(403).json({
                message: "Admin accounts cannot access customer features.",
                success: false,
            });
        }
        const customer = await UserModel.findById(decoded.id).select("_id");
        if (!customer) {
            return res.status(403).json({
                message: "A customer account is required for this feature.",
                success: false,
            });
        }
        req.token = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: error.name === "TokenExpiredError"
                ? "Your session has expired. Please sign in again."
                : "Your session is invalid. Please sign in again.",
            success: false,
        });
    }
};

module.exports = verify_token;
