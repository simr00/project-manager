import express from "express";

import authRoutes from "./auth.js";
import workspaceRoutes from "./workspace.js";
import projectRoutes from "./project.js";
import taskRoutes from "./task.js";
import userRoutes from "./user.js";
import messageRoutes from "./message.js";
import uploadRoutes from "./upload.js";





const router = express.Router();

router.use("/auth", authRoutes);
router.use("/workspaces", workspaceRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/users", userRoutes);
router.use("/messages", messageRoutes);
router.use("/upload", uploadRoutes);
router.patch("/messages/read/:userId", async (req, res) => {
  const myId = req.user._id;
  const { userId } = req.params;

  await Message.updateMany(
    { sender: userId, receiver: myId, read: false },
    { $set: { read: true } }
  );

  res.json({ success: true });
});

export default router;
