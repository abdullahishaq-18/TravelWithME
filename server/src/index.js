require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./db");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const feedRoutes = require("./routes/feed");
const postRoutes = require("./routes/posts");
const meetupRoutes = require("./routes/meetups");
const notificationRoutes = require("./routes/notifications");
const createMessagesRouter = require("./routes/messages");

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
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

io.on("connection", (socket) => {
  socket.on("conversation:join", (conversationId) => {
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
