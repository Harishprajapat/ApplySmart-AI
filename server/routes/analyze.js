import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Analysis from "../models/Analysis.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

function extractJsonObject(text) {
  const cleanText = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response");
  }

  return cleanText.slice(firstBrace, lastBrace + 1);
}

router.post("/", protect, async (req, res) => {
  try {
    const { resume, jd } = req.body;

    if (!resume || !jd) {
      return res.status(400).json({ error: "Resume and job description are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing Gemini API key. Set GEMINI_API_KEY in server/.env.",
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an ATS system.

Analyze this resume against the job description.

Return ONLY valid JSON in this shape:
{
  "score": number (0-100),
  "matched": [skills],
  "missing": [skills],
  "suggestions": [improvements]
}

Resume:
${resume}

Job Description:
${jd}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    const jsonText = extractJsonObject(rawText);
    const parsed = JSON.parse(jsonText);

    const analysis = await Analysis.create({
      user: req.user,
      resume,
      jd,
      score: Number(parsed.score) || 0,
      matched: Array.isArray(parsed.matched) ? parsed.matched : [],
      missing: Array.isArray(parsed.missing) ? parsed.missing : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    });

    res.json({
      score: analysis.score,
      matched: analysis.matched,
      missing: analysis.missing,
      suggestions: analysis.suggestions,
      id: analysis._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

// GET user past analyses
router.get("/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user })
      .sort({ createdAt: -1 }); // latest first

    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default router;
