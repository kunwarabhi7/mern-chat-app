import Message from "../models/message.model.js";
import { Server } from "socket.io";

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on(
      "sendMessage",
      async ({ senderId, recipientId, content, sticker }) => {
        try {
          const message = new Message({
            sender: senderId,
            recipient: recipientId,
            content,
            sticker,
          });
          await message.save();

          const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username")
            .populate("recipient", "username");

          io.to(senderId)
            .to(recipientId)
            .emit("receiveMessage", populatedMessage);
        } catch (error) {
          console.error("Error sending message via Socket.IO:", error.message);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
