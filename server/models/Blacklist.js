import mongoose from "mongoose";

const blackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
    },
    expiresAt: { type: Date, required: [true, "Expiration Date is required"] },
  },
  { timestamps: true }
);

const BlackList = mongoose.model("BlackList", blackListSchema);
export default BlackList;
