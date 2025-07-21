// controllers/message.controller.js
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
  const { recipient, content, sticker } = req.body;
  try {
    if (!recipient) {
      return res.status(400).json({ message: "Recipient is required" });
    }
    if (!content && !sticker) {
      return res
        .status(400)
        .json({ message: "Content or sticker is required" });
    }
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    const message = new Message({
      sender: req.user.id,
      recipient,
      content,
      sticker,
    });
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username")
      .populate("recipient", "username");
    res.status(201).json({ message: "Message sent", data: populatedMessage });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const receiveMessage = async (req, res) => {
  const { recipientId } = req.params;
  try {
    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: recipientId },
        { sender: recipientId, recipient: req.user.id },
      ],
    })
      .populate("sender", "username")
      .populate("recipient", "username")
      .sort({ createdAt: 1 });
    res.status(200).json({ messages }); // Changed from { message } to { messages }
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
