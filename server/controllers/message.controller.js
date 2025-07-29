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
      .populate("sender", "username email dp")
      .populate("recipient", "username email dp");

    const formattedMessage = {
      ...populatedMessage.toObject(),
      _id: populatedMessage._id.toString(),
      sender: {
        ...populatedMessage.sender.toObject(),
        _id: populatedMessage.sender._id.toString(),
      },
      recipient: {
        ...populatedMessage.recipient.toObject(),
        _id: populatedMessage.recipient._id.toString(),
      },
    };

    // Emit socket event for real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(String(req.user.id))
        .to(String(recipient))
        .emit("receiveMessage", formattedMessage);
      console.log("Emitted receiveMessage from sendMessage:", formattedMessage);
    } else {
      console.error("Socket.IO instance not found");
    }

    res.status(201).json({ message: "Message sent", data: formattedMessage });
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
      .populate("sender", "username email dp")
      .populate("recipient", "username email dp")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => ({
      ...msg.toObject(),
      _id: msg._id.toString(),
      sender: {
        ...msg.sender.toObject(),
        _id: msg.sender._id.toString(),
      },
      recipient: {
        ...msg.recipient.toObject(),
        _id: msg.recipient._id.toString(),
      },
    }));

    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
