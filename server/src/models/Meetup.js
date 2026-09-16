const mongoose = require("mongoose");

const meetupSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    placeName: { type: String, required: true },
    startsAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 120 },
    capacity: { type: Number, default: 10 },
    minTier: { type: Number, enum: [1, 2, 3], default: 2 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    photoUrl: { type: String, default: null },
    ratedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meetup", meetupSchema);
