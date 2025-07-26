import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import connectToDB from "./utils/connectToDB.js";
import { UserRouter } from "./routes/user.route.js";
import { MessageRouter } from "./routes/message.route.js";
import { setupSocket } from "./utils/Socket.js";
import path from "path";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const server = createServer(app);

//Initialize app
const io = setupSocket(server, app);

// cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS for preflight
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//middlewares
app.use("/uploads", express.static(path.join("uploads")));
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/user", UserRouter);
app.use("/api/message", MessageRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Route working fine" });
});

// Start server
const startServer = async () => {
  try {
    await connectToDB();

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
