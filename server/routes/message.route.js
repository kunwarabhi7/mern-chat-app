import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  receiveMessage,
  sendMessage,
} from "../controllers/message.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Message Route Working" });
});

//send Message
router.post("/", authMiddleware, sendMessage);

// Recieve Message
router.get("/:recipientId", authMiddleware, receiveMessage);
export { router as MessageRouter };
