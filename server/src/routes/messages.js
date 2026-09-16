const express = require("express");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Meetup = require("../models/Meetup");
const requireAuth = require("../middleware/auth");

function serializeConversation(conversation, userId) {
  const other = conversation.isGroup
    ? null
    : conversation.participants.find((p) => p._id.toString() !== userId);
  return {
    id: conversation._id,
    isGroup: conversation.isGroup,
    meetup: conversation.meetup,
    participants: conversation.participants.map((p) => p.toPublicJSON()),
    other: other ? other.toPublicJSON() : null,
    lastMessageAt: conversation.lastMessageAt,
  };
}

module.exports = function createMessagesRouter(io) {
  const router = express.Router();

  router.get("/", requireAuth, async (req, res) => {
    const conversations = await Conversation.find({ participants: req.userId })
      .populate("participants")
      .sort("-lastMessageAt");
    res.json({ conversations: conversations.map((c) => serializeConversation(c, req.userId)) });
  });

  router.post("/direct", requireAuth, async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [req.userId, userId], $size: 2 },
    }).populate("participants");

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.userId, userId] });
      conversation = await conversation.populate("participants");
    }

    res.json({ conversation: serializeConversation(conversation, req.userId) });
  });

  router.post("/meetup/:meetupId", requireAuth, async (req, res) => {
    const meetup = await Meetup.findById(req.params.meetupId);
    if (!meetup) return res.status(404).json({ message: "Meetup not found" });

    let conversation = await Conversation.findOne({ meetup: meetup._id });
    if (!conversation) {
      conversation = await Conversation.create({
        isGroup: true,
        meetup: meetup._id,
        participants: meetup.attendees,
      });
    } else {
      const missing = meetup.attendees.filter(
        (a) => !conversation.participants.some((p) => p.toString() === a.toString())
      );
      if (missing.length) {
        conversation.participants.push(...missing);
        await conversation.save();
      }
    }
    conversation = await conversation.populate("participants");

    res.json({ conversation: serializeConversation(conversation, req.userId) });
  });

  router.get("/:id/messages", requireAuth, async (req, res) => {
    const messages = await Message.find({ conversation: req.params.id })
      .populate("sender")
      .populate("sharedMeetup")
      .sort("createdAt");
    res.json({
      messages: messages.map((m) => ({
        id: m._id,
        conversation: m.conversation,
        sender: m.sender.toPublicJSON(),
        text: m.text,
        sharedMeetup: m.sharedMeetup,
        createdAt: m.createdAt,
      })),
    });
  });

  router.post("/:id/messages", requireAuth, async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });

    const message = await Message.create({ conversation: conversation._id, sender: req.userId, text });
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();

    const populated = await message.populate("sender");
    const payload = {
      id: populated._id,
      conversation: populated.conversation,
      sender: populated.sender.toPublicJSON(),
      text: populated.text,
      sharedMeetup: null,
      createdAt: populated.createdAt,
    };

    io.to(conversation._id.toString()).emit("message:new", payload);
    res.status(201).json({ message: payload });
  });

  return router;
};
