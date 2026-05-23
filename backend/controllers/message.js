import Message from "../models/message.js";

// 🔥 SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, text, file } = req.body; // ✅ added file

    const message = await Message.create({
      sender,
      receiver,
      text: text || "",   // ✅ allow empty text
      file: file || "",   // ✅ save file (fix)
    });

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending message" });
  }
};

// 🔥 GET CHAT BETWEEN TWO USERS
export const getMessages = async (req, res) => {
  try {
    const myId = req.user?._id || req.query.myId;
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages || []); // ✅ safety fix
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
};
import Message from "../models/message.model.js";

export const deleteChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const { myId } = req.query;

    console.log("DELETE CHAT:", userId, myId);

    if (!userId || !myId) {
      return res.status(400).json({ message: "Missing IDs" });
    }

    // ✅ NO ObjectId conversion needed
    const result = await Message.deleteMany({
      $or: [
        { sender: userId, receiver: myId },
        { sender: myId, receiver: userId },
      ],
    });

    console.log("Deleted count:", result.deletedCount);

    return res.status(200).json({
      message: "Chat deleted",
      count: result.deletedCount,
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
