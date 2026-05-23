import express from "express";
import { sendMessage, getMessages,deleteChat  } from "../controllers/message.js";

const router = express.Router();

// POST → send message
router.post("/", sendMessage);

// GET → fetch messages
router.get("/:userId", getMessages);
router.delete("/:userId", deleteChat);
export default router;
