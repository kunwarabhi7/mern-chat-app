// utils/Socket.js
import { Server } from "socket.io";
import Message from "../models/message.model.js";

const onlineUsers = new Map(); // Map<userId, socketId>

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle user joining
    socket.on("join", (userId) => {
      console.log(`User ${userId} joined`);
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      console.log("Online users:", Array.from(onlineUsers.keys()));
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // Handle typing event
    socket.on("typing", ({ senderId, recipientId }) => {
      console.log(`User ${senderId} is typing to ${recipientId}`);
      io.to(recipientId).emit("typing", { senderId });
    });

    // Handle stop typing event
    socket.on("stopTyping", ({ senderId, recipientId }) => {
      console.log(`User ${senderId} stopped typing to ${recipientId}`);
      io.to(recipientId).emit("stopTyping", { senderId });
    });

    // Handle sending messages
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
          .populate("sender", "username email")
          .populate("recipient", "username email");

        io.to(senderId)
          .to(recipientId)
          .emit("receiveMessage", populatedMessage);
        console.log("Message sent to users:", senderId, recipientId);
      } catch (error) {
        console.error("Error saving message:", error.message);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle disconnection
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
