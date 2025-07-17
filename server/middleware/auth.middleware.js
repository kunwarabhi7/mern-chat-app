import jwt from "jsonwebtoken";
import BlackList from "../models/Blacklist.js";

const authMiddleware = async (req, res, next) => {
  // Ensure cookie-parser is working
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const isBlacklisted = await BlackList.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token is blacklisted" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, exp: decoded.exp };
    req.token = token; // Attach token for controllers

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export default authMiddleware;
