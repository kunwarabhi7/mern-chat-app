import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectToDB from "./utils/connectToDB.js";
import { UserRouter } from "./routes/user.route.js";
import { MessageRouter } from "./routes/message.route.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { setupSocket } from "./utils/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);

// ✅ Ensure uploads folder exists (important for Render)
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ✅ CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://abhichatkaro.vercel.app",
  "https://mern-chat-app-bice.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Middlewares
app.use("/api/uploads", express.static(uploadsPath));
app.use(express.json({ limit: "5mb" })); // ✅ allow bigger base64 images
app.use(express.urlencoded({ extended: true, limit: "5mb" })); // for safety
app.use(cookieParser());

// ✅ Routes
app.use("/api/user", UserRouter);
app.use("/api/message", MessageRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Route working fine" });
});

// ✅ Socket setup
const io = setupSocket(server, app);

// ✅ Start server
const startServer = async () => {
  try {
    await connectToDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
};

startServer();
