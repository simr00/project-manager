import express from "express";
import { sendMessage, getMessages } from "../controllers/message.js";

const router = express.Router();

// POST → send message
router.post("/", sendMessage);

// GET → fetch messages
router.get("/:userId", getMessages);

export default router;