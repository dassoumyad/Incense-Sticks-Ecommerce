const express = require("express");
const router = express.Router();
const { chatWithStoreAssistant } = require("../controllers/chat.controllers");

const windowsByIp = new Map();
const limitChatRequests = (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const current = windowsByIp.get(ip);
  if (!current || now - current.startedAt >= 60_000) {
    windowsByIp.set(ip, { startedAt: now, count: 1 });
    return next();
  }
  if (current.count >= 12) {
    return res.status(429).json({ success: false, message: "Please wait a moment before sending more chat messages." });
  }
  current.count += 1;
  return next();
};

router.post("/message", limitChatRequests, chatWithStoreAssistant);

module.exports = router;
