const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    meetup: { type: mongoose.Schema.Types.ObjectId, ref: "Meetup", required: true },
    rater: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, min: 1, max: 5, required: true },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

ratingSchema.index({ meetup: 1, rater: 1, ratee: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
