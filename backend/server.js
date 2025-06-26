// backend/server.js

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // For local/demo use, allow all origins
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// In-memory session state
const sessions = {};

// REST endpoint: Create a new session
app.post("/api/session", (req, res) => {
  const { bugCount } = req.body;
  if (
    typeof bugCount !== "number" ||
    !Number.isInteger(bugCount) ||
    bugCount < 1 ||
    bugCount > 100
  ) {
    return res.status(400).json({ error: "bugCount must be an integer between 1 and 100" });
  }
  const sessionId = uuidv4();
  sessions[sessionId] = {
    bugCount,
    squashed: [],
    createdAt: new Date()
  };
  res.json({ sessionId });
});

// REST endpoint: Get session state
app.get("/api/session/:id", (req, res) => {
  const session = sessions[req.params.id];
  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }
  res.json({
    bugCount: session.bugCount,
    squashed: session.squashed
  });
});

// Socket.IO events
io.on("connection", (socket) => {
  // Join a session room
  socket.on("join-session", (sessionId) => {
    if (!sessions[sessionId]) {
      socket.emit("error", "Session not found");
      return;
    }
    socket.join(sessionId);
    // Send current state to the new client
    socket.emit("session-update", {
      bugCount: sessions[sessionId].bugCount,
      squashed: sessions[sessionId].squashed
    });
  });

  // Handle bug squash
  socket.on("squash-bug", ({ sessionId, bugIndex }) => {
    const session = sessions[sessionId];
    if (!session) {
      socket.emit("error", "Session not found");
      return;
    }
    if (
      typeof bugIndex !== "number" ||
      bugIndex < 0 ||
      bugIndex >= session.bugCount ||
      session.squashed.includes(bugIndex)
    ) {
      return; // Invalid or already squashed
    }
    session.squashed.push(bugIndex);
    // Broadcast updated state to all clients in the session
    io.to(sessionId).emit("session-update", {
      bugCount: session.bugCount,
      squashed: session.squashed
    });
    // If all bugs are squashed, show trophy
    if (session.squashed.length === session.bugCount) {
      io.to(sessionId).emit("show-trophy");
    }
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Bug Bash backend listening on port ${PORT}`);
});