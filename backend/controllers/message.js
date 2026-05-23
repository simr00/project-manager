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
export const deleteChat = async (req, res) => {
  try {
    const userId = req.params.userId;
    const myId = req.query.myId;

    console.log("PARAMS:", userId);
    console.log("QUERY:", myId);

    // ❌ if missing
    if (!userId || !myId) {
      return res.status(400).json({ message: "Missing IDs" });
    }

    // ❌ if invalid
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(myId)
    ) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const deleted = await Message.deleteMany({
      $or: [
        { sender: userId, receiver: myId },
        { sender: myId, receiver: userId },
      ],
    });

    return res.status(200).json({
      message: "Deleted",
      count: deleted.deletedCount,
    });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};
