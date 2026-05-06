import mongoose from "mongoose";

const aiHistoryDataSchema = new mongoose.Schema(
  {
    atsScore: {
      type: Number,
      default: null,
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    content: {
      type: String,
      default: "",
    },
  },
  { _id: false },
);

const aiHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["resume", "cover_letter"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: aiHistoryDataSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export default mongoose.model("AIHistory", aiHistorySchema);
