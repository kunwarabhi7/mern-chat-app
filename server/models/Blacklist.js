// models/Blacklist.js
import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "1h", // Auto-remove after 1 hour
  },
});

const BlackList = mongoose.model("BlackList", blacklistSchema);
export default BlackList;
