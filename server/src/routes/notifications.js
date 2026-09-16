const express = require("express");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const notifications = await Notification.find({ user: req.userId }).sort("-createdAt").limit(50);
  res.json({ notifications });
});

router.post("/mark-all-read", requireAuth, async (req, res) => {
  await Notification.updateMany({ user: req.userId, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

module.exports = router;
