import { Server } from "socket.io";
import Message from "../models/message.model.js";

const onlineUsers = new Map();

export const setupSocket = (server, app) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    socket.on("join", (userId) => {
      if (!userId) {
        console.error("Join failed: No userId provided");
        socket.emit("error", { message: "User ID required" });
        return;
      }
      console.log(`User ${userId} joined`);
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log("Online users:", Array.from(onlineUsers.keys()));
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("typing", ({ senderId, recipientId }) => {
      if (!senderId || !recipientId) {
        console.error("Typing event failed:", { senderId, recipientId });
        socket.emit("error", { message: "Invalid sender or recipient ID" });
        return;
      }
      console.log(`User ${senderId} is typing to ${recipientId}`);
      io.to(recipientId).emit("typing", { senderId });
    });

    socket.on("stopTyping", ({ senderId, recipientId }) => {
      if (!senderId || !recipientId) {
        console.error("StopTyping event failed:", { senderId, recipientId });
        socket.emit("error", { message: "Invalid sender or recipient ID" });
        return;
      }
      console.log(`User ${senderId} stopped typing to ${recipientId}`);
      io.to(recipientId).emit("stopTyping", { senderId });
    });

    socket.on("sendMessage", async (messageData) => {
      try {
        console.log("Received message data:", messageData);
        const { senderId, recipientId, content, sticker } = messageData;

        if (!senderId || !recipientId) {
          socket.emit("error", { message: "Invalid sender or recipient ID" });
          return;
        }

        const message = new Message({
          sender: senderId,
          recipient: recipientId,
          content: content || "",
          sticker: sticker || null,
        });
        await message.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username email dp")
          .populate("recipient", "username email dp");

        io.to(senderId)
          .to(recipientId)
          .emit("receiveMessage", populatedMessage);
        console.log("Message sent to users:", senderId, recipientId);
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          console.log(`User ${userId} went offline`);
          io.emit("onlineUsers", Array.from(onlineUsers.keys()));
          break;
        }
      }
    });
  });

  return io;
};
