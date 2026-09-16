const express = require("express");
const Post = require("../models/Post");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { caption, photoUrl, location } = req.body;
  if (!caption) return res.status(400).json({ message: "caption is required" });

  const post = await Post.create({ author: req.userId, caption, photoUrl, location });
  const populated = await post.populate("author");
  res.status(201).json({
    post: {
      id: populated._id,
      createdAt: populated.createdAt,
      author: populated.author.toPublicJSON(),
      photoUrl: populated.photoUrl,
      caption: populated.caption,
      location: populated.location,
    },
  });
});

module.exports = router;
