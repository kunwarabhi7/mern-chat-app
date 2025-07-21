import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required"],
    },
    content: {
      type: String,
      trim: true,
    },
    sticker: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Optimize index for fetching and sorting messages
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
