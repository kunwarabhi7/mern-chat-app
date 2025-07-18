import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDB from "./utills/connectToDB.js";
import { UserRouter } from "./routes/user.route.js";
import cookieParser from "cookie-parser";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

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
app.use(express.json());
app.use(cookieParser());

//Routes
app.use("/api/user", UserRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Route working fine" });
});

// Start server
const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();
