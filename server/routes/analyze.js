import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { resume, jd } = req.body;
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

Analyze this resume against job description.

Return ONLY valid JSON:
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
    const text = response.text();

    // ⚠️ Gemini sometimes adds extra text → clean it
    const cleanText = text.replace(/```json|```/g, "").trim();

    const parsed = JSON.parse(cleanText);

    res.json(parsed);
  } catch (err) {
    console.error(err);
    const isInvalidKey =
      err?.status === 400 &&
      Array.isArray(err?.errorDetails) &&
      err.errorDetails.some((detail) => detail?.reason === "API_KEY_INVALID");

    if (isInvalidKey) {
      return res.status(401).json({
        error: "Gemini API key is invalid. Create a valid key and update server/.env.",
      });
    }

    res.status(500).json({ error: "AI error" });
  }
});

export default router;
