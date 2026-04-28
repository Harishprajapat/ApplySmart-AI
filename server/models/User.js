import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  analysesCount: {
  type: Number,
  default: 0,
},
plan: {
  type: String,
  enum: ["free", "pro"],
  default: "free",
}, },
{ timestamps: true });

export default mongoose.model("User", userSchema);