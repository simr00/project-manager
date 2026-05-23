import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ TEXT OPTIONAL NOW
    text: {
      type: String,
      default: "",
    },
read: { type: Boolean, default: false },
    // ✅ ADD FILE FIELD (VERY IMPORTANT)
    file: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
