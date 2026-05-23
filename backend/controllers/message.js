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
    const { userId } = req.params;
    const { myId } = req.query;

    // ✅ validate ids
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(myId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    // 🔥 convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const myObjectId = new mongoose.Types.ObjectId(myId);

    // 🔥 delete both sides chat
    await Message.deleteMany({
      $or: [
        { sender: myObjectId, receiver: userObjectId },
        { sender: userObjectId, receiver: myObjectId },
      ],
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
