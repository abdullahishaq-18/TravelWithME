const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    isGroup: { type: Boolean, default: false },
    meetup: { type: mongoose.Schema.Types.ObjectId, ref: "Meetup", default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
