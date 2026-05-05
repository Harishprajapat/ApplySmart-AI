import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    analysesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    lastReset: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
