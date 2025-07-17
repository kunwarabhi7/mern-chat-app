import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import BlackList from "../models/Blacklist.js";

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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All Fields are required" });
  }
  try {
    const user = await User.findOne({ email });
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
      user: { id: user._id, username: user.username, email: user.email },
      message: "Login Successfull",
    });
  } catch (error) {
    console.error("Error while logging in:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    res.status(200).json({
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (!req.token || !req.user?.exp) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const expiresAt = new Date(req.user.exp * 1000);
    await BlackList.create({ token: req.token, expiresAt });
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
