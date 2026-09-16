const express = require("express");
const User = require("../models/User");
const Meetup = require("../models/Meetup");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ user: user.toPublicJSON() });
});

router.patch("/me", requireAuth, async (req, res) => {
  const { bio, interests, city, country, avatarUrl, nextDestination } = req.body;
  const user = await User.findById(req.userId);
  if (bio !== undefined) user.bio = bio;
  if (interests !== undefined) user.interests = interests;
  if (city !== undefined) user.city = city;
  if (country !== undefined) user.country = country;
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
  if (nextDestination !== undefined) user.nextDestination = nextDestination;
  await user.save();
  res.json({ user: user.toPublicJSON() });
});

// Advance verification tier: 2 = phone confirmed, 3 = government ID confirmed.
router.post("/me/verify", requireAuth, async (req, res) => {
  const { tier, phone } = req.body;
  if (![2, 3].includes(tier)) return res.status(400).json({ message: "tier must be 2 or 3" });

  const user = await User.findById(req.userId);
  if (tier === 2 && user.tier < 2) {
    user.tier = 2;
    if (phone) user.phone = phone;
  }
  if (tier === 3 && user.tier < 3) {
    user.tier = 3;
  }
  await user.save();
  res.json({ user: user.toPublicJSON() });
});

router.get("/:id", requireAuth, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const sharedMeetups = await Meetup.countDocuments({
    attendees: { $all: [req.userId, req.params.id] },
  });

  res.json({ user: user.toPublicJSON(), sharedMeetups });
});

module.exports = router;
