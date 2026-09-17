const express = require("express");
const Meetup = require("../models/Meetup");
const User = require("../models/User");
const Rating = require("../models/Rating");
const Notification = require("../models/Notification");
const requireAuth = require("../middleware/auth");

const router = express.Router();

function serializeMeetup(meetup, userId) {
  return {
    id: meetup._id,
    title: meetup.title,
    description: meetup.description,
    category: meetup.category,
    placeName: meetup.placeName,
    startsAt: meetup.startsAt,
    durationMinutes: meetup.durationMinutes,
    capacity: meetup.capacity,
    minTier: meetup.minTier,
    photoUrl: meetup.photoUrl,
    host: meetup.host.toPublicJSON ? meetup.host.toPublicJSON() : meetup.host,
    attendees: meetup.attendees.map((a) => (a.toPublicJSON ? a.toPublicJSON() : a)),
    joined: meetup.attendees.some((a) => (a._id || a).toString() === userId),
  };
}

router.post("/", requireAuth, async (req, res) => {
  const { title, description, category, placeName, startsAt, durationMinutes, capacity, minTier, photoUrl } = req.body;
  if (!title || !placeName || !startsAt) {
    return res.status(400).json({ message: "title, placeName and startsAt are required" });
  }
  const meetup = await Meetup.create({
    host: req.userId,
    title,
    description,
    category,
    placeName,
    startsAt,
    durationMinutes,
    capacity,
    minTier,
    photoUrl,
    attendees: [req.userId],
  });
  const populated = await meetup.populate(["host", "attendees"]);
  res.status(201).json({ meetup: serializeMeetup(populated, req.userId) });
});

router.get("/:id", requireAuth, async (req, res) => {
  const meetup = await Meetup.findById(req.params.id).populate(["host", "attendees"]);
  if (!meetup) return res.status(404).json({ message: "Meetup not found" });
  res.json({ meetup: serializeMeetup(meetup, req.userId) });
});

router.post("/:id/join", requireAuth, async (req, res) => {
  const meetup = await Meetup.findById(req.params.id);
  if (!meetup) return res.status(404).json({ message: "Meetup not found" });

  const user = await User.findById(req.userId);
  if (user.tier < meetup.minTier) {
    return res.status(403).json({ message: `Tier ${meetup.minTier}+ required to join this meetup` });
  }
  if (meetup.attendees.length >= meetup.capacity) {
    return res.status(409).json({ message: "This meetup is full" });
  }
  if (!meetup.attendees.some((a) => a.toString() === req.userId)) {
    meetup.attendees.push(req.userId);
    await meetup.save();

    await Notification.create({
      user: meetup.host,
      type: "meetup_join",
      text: `${user.name} joined your meetup in ${meetup.placeName}.`,
      meta: { meetupId: meetup._id, userId: user._id },
    });
  }

  const populated = await meetup.populate(["host", "attendees"]);
  res.json({ meetup: serializeMeetup(populated, req.userId) });
});

// Attendees still waiting to be rated by the current user for this meetup.
router.get("/:id/rating-queue", requireAuth, async (req, res) => {
  const meetup = await Meetup.findById(req.params.id).populate("attendees");
  if (!meetup) return res.status(404).json({ message: "Meetup not found" });
  if (!meetup.attendees.some((a) => a._id.toString() === req.userId)) {
    return res.status(403).json({ message: "Only attendees can rate this meetup" });
  }

  const already = await Rating.find({ meetup: meetup._id, rater: req.userId }).select("ratee");
  const ratedIds = new Set(already.map((r) => r.ratee.toString()));

  const queue = meetup.attendees
    .filter((a) => a._id.toString() !== req.userId && !ratedIds.has(a._id.toString()))
    .map((a) => a.toPublicJSON());

  res.json({ meetupTitle: meetup.title, queue });
});

router.post("/:id/ratings", requireAuth, async (req, res) => {
  const { rateeId, stars, tags } = req.body;
  if (!rateeId || !stars) return res.status(400).json({ message: "rateeId and stars are required" });
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ message: "stars must be an integer between 1 and 5" });
  }
  if (rateeId === req.userId) {
    return res.status(400).json({ message: "You can't rate yourself" });
  }

  const meetup = await Meetup.findById(req.params.id);
  if (!meetup) return res.status(404).json({ message: "Meetup not found" });
  if (!meetup.attendees.some((a) => a.toString() === req.userId)) {
    return res.status(403).json({ message: "Only attendees can rate this meetup" });
  }
  if (!meetup.attendees.some((a) => a.toString() === rateeId)) {
    return res.status(400).json({ message: "rateeId did not attend this meetup" });
  }

  try {
    await Rating.create({ meetup: meetup._id, rater: req.userId, ratee: rateeId, stars, tags: tags || [] });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "You already rated this traveler for this meetup" });
    throw err;
  }

  const ratee = await User.findById(rateeId);
  const newCount = ratee.ratingCount + 1;
  const newAvg = (ratee.ratingAvg * ratee.ratingCount + stars) / newCount;
  ratee.ratingAvg = Math.round(newAvg * 10) / 10;
  ratee.ratingCount = newCount;
  for (const tag of tags || []) {
    ratee.ratingTagCounts.set(tag, (ratee.ratingTagCounts.get(tag) || 0) + 1);
  }
  await ratee.save();

  await Notification.create({
    user: ratee._id,
    type: "rating_update",
    text: `Your trust rating is now ${ratee.ratingAvg} from ${ratee.ratingCount} meetups.`,
  });

  res.status(201).json({ ratingAvg: ratee.ratingAvg, ratingCount: ratee.ratingCount });
});

module.exports = router;
