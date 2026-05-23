import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import http from "http";
import { Server } from "socket.io";

import routes from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import messageRoutes from "./routes/message.js";




dotenv.config();

const app = express();

// 🔥 CREATE HTTP SERVER (IMPORTANT)
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "https://project-manager-38hq.vercel.app",
  "https://project-manager-38hq-git-main-simranjit-kaur-s-projects.vercel.app",
];

// 🔥 SOCKET SETUP
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let onlineUsers = {};

// 🔥 SOCKET LOGIC
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🟢 USER ONLINE
  socket.on("join", (userId) => {
    onlineUsers[userId] = socket.id;

    io.emit("onlineUsers", Object.keys(onlineUsers));
  });

  // ⚡ SEND MESSAGE
  socket.on("sendMessage", (msg) => {
    const receiverSocket = onlineUsers[msg.receiver];

    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", msg);
    }
  });

  // ✍️ TYPING
  socket.on("typing", ({ to }) => {
    const receiverSocket = onlineUsers[to];

    if (receiverSocket) {
      io.to(receiverSocket).emit("typing");
    }
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }

    io.emit("onlineUsers", Object.keys(onlineUsers));
  });
});

// MIDDLEWARES


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(morgan("dev"));
app.use(express.json());

// DB CONNECTION
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));

// ROUTES
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHub API",
  });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api-v1", routes);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});
app.use("/api-v1/messages", messageRoutes);
// NOT FOUND
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.get("/.well-known/*", (req, res) => {
  res.status(204).end();
});
// 🔥 IMPORTANT: USE server.listen (NOT app.listen)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running with socket on port ${PORT}`);
});
