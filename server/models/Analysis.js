import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resume: String,
  jd: String,
  score: Number,
  matched: [String],
  missing: [String],
  suggestions: [String],
  improvedResume: String,
}, { timestamps: true });

export default mongoose.model("Analysis", analysisSchema);
