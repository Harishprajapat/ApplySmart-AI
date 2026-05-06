import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import analyzeRoute from "./routes/analyze.js";
import authRoute from "./routes/auth.js";
import coverLetterRoute from "./routes/coverLetter.js";
import historyRoute from "./routes/history.js";
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/analyze", analyzeRoute);
app.use("/api/auth", authRoute);
app.use("/api/cover-letter", coverLetterRoute);
app.use("/api/history", historyRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
