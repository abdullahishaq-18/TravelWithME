const express = require("express");
const Post = require("../models/Post");
const Meetup = require("../models/Meetup");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const type = req.query.type || "all";
  const items = [];

  if (type === "all" || type === "posts") {
    const posts = await Post.find().populate("author").sort("-createdAt").limit(20);
    for (const post of posts) {
      items.push({
        kind: "post",
        id: post._id,
        createdAt: post.createdAt,
        author: post.author.toPublicJSON(),
        photoUrl: post.photoUrl,
        caption: post.caption,
        location: post.location,
      });
    }
  }

  if (type === "all" || type === "travelers") {
    const travelers = await User.find({ _id: { $ne: req.userId } }).sort("-createdAt").limit(20);
    for (const traveler of travelers) {
      items.push({
        kind: "traveler",
        id: traveler._id,
        createdAt: traveler.createdAt,
        user: traveler.toPublicJSON(),
      });
    }
  }

  if (type === "all" || type === "meetups") {
    const meetups = await Meetup.find().populate("host").sort("-createdAt").limit(20);
    for (const meetup of meetups) {
      items.push({
        kind: "meetup",
        id: meetup._id,
        createdAt: meetup.createdAt,
        host: meetup.host.toPublicJSON(),
        title: meetup.title,
        placeName: meetup.placeName,
        startsAt: meetup.startsAt,
        attendeeCount: meetup.attendees.length,
        capacity: meetup.capacity,
        minTier: meetup.minTier,
        photoUrl: meetup.photoUrl,
        joined: meetup.attendees.some((a) => a.toString() === req.userId),
      });
    }
  }

  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ items });
});

module.exports = router;
