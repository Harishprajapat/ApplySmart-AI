import mongoose from "mongoose";

const coverLetterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resume: { type: String, required: true },
    jd: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("CoverLetter", coverLetterSchema);
