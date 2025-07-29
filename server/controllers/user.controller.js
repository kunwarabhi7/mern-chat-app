import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import BlackList from "../models/Blacklist.model.js";
import fs from "fs";

dotenv.config();

export const SignUp = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    //create new User
    const newUser = new User({ username, email, password });
    newUser.dp = "uploads/default-dp.png";

    await newUser.save();
    //Generate JWT TOKEN
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(token);
    //Cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });

    res.status(201).json({
      token,
      user: { id: newUser._id, username, email },
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error while creating user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const Login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "All Fields are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "InValid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "InValid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000,
    });
    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        dp: user.dp || "/images/default-dp.png",
      },
      message: "Login Successfull",
    });
  } catch (error) {
    console.error("Error while logging in:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    console.log("Fetching user for ID:", req.user.id);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.log("User not found for ID:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        dp: user.dp || "/images/default-dp.png",
      },
    });
  } catch (error) {
    console.error("Error in /user/me:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      "-password"
    );
    console.log("Fetched users from DB:", users); // Debug log
    res.json({
      user: users
        .map((u) => {
          if (!u._id) {
            console.error("User missing _id:", u);
            return null;
          }
          return {
            id: u._id.toString(),
            username: u.username || "Unknown",
            email: u.email || "",
            dp: u.dp || "/images/default-dp.png",
          };
        })
        .filter((u) => u !== null), // Remove any null entries
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;
    console.log("Logout token:", token);
    if (!token) {
      console.log("No token provided for logout");
      return res.status(400).json({ message: "No token provided" });
    }
    // Check if token is already blacklisted (optional, to avoid duplicates)
    const existing = await BlackList.findOne({ token });
    if (existing) {
      console.log("Token already blacklisted:", token);
      res.clearCookie("token");
      return res.status(200).json({ message: "Logout successful" });
    }
    await BlackList.create({ token });
    console.log("Token blacklisted:", token);
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error in logout:", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Server error during logout", error: error.message });
  }
};

export const uploadDP = async (req, res) => {
  try {
    console.log("DP upload request:", {
      body: req.body,
      file: req.file,
      user: req.user,
    });

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete existing dp if exists
    if (user.dp) {
      try {
        const oldDpPath = path.join("uploads", path.basename(user.dp));
        if (fs.existsSync(oldDpPath)) {
          fs.unlinkSync(oldDpPath);
          console.log("Old DP deleted:", oldDpPath);
        }
      } catch (error) {
        console.error("Error deleting old DP:", error.message);
      }
    }

    // Save new dp
    user.dp = `/uploads/${req.file.filename}`;
    await user.save();
    console.log("New DP saved:", user.dp);

    // Emit userUpdated event via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("userUpdated", {
        id: user._id,
        username: user.username,
        email: user.email,
        dp: user.dp,
      });
      console.log("Emitted userUpdated event for user:", user._id);
    } else {
      console.error("Socket.IO instance not found");
    }

    res.status(200).json({ message: "DP updated successfully", dp: user.dp });
  } catch (error) {
    console.error("Error uploading DP:", error.message, error.stack);
    res
      .status(500)
      .json({ message: "Failed to upload DP", error: error.message });
  }
};
