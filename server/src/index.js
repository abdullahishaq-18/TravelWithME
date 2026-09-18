require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const connectDB = require("./db");
const Conversation = require("./models/Conversation");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const feedRoutes = require("./routes/feed");
const postRoutes = require("./routes/posts");
const meetupRoutes = require("./routes/meetups");
const notificationRoutes = require("./routes/notifications");
const createMessagesRouter = require("./routes/messages");

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const io = new Server(server, { cors: { origin: clientOrigin } });

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/meetups", meetupRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", createMessagesRouter(io));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return res.status(400).json({ message });
  }
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Missing authorization token"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  socket.on("conversation:join", async (conversationId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;
    const isParticipant = conversation.participants.some((p) => p.toString() === socket.userId);
    if (!isParticipant) return;
    socket.join(conversationId);
  });
  socket.on("conversation:leave", (conversationId) => {
    socket.leave(conversationId);
  });
});

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(port, () => console.log(`TravelWithMe API listening on :${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
