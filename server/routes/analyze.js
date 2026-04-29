import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const FREE_MONTHLY_LIMIT = 5;

function extractJsonObject(text) {
  const cleanText = text.replace(/```json|```/g, "").trim();
  const firstBrace = cleanText.indexOf("{");
  const lastBrace = cleanText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response");
  }

  return cleanText.slice(firstBrace, lastBrace + 1);
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeAnalysisPayload(parsed) {
  return {
    score: Number(parsed?.score) || 0,
    matched: normalizeStringArray(parsed?.matched),
    missing: normalizeStringArray(parsed?.missing),
    suggestions: normalizeStringArray(parsed?.suggestions),
    improvedResume:
      typeof parsed?.improved_resume === "string" && parsed.improved_resume.trim()
        ? parsed.improved_resume.trim()
        : "",
  };
}

function getCurrentMonthBounds() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { startOfMonth, startOfNextMonth };
}

async function getMonthlyUsage(userId) {
  const { startOfMonth, startOfNextMonth } = getCurrentMonthBounds();
  return Analysis.countDocuments({
    user: userId,
    createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
  });
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

    const user = await User.findById(req.user).select("plan");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const used = await getMonthlyUsage(req.user);
    const isFreePlan = user.plan !== "pro";

    if (isFreePlan && used >= FREE_MONTHLY_LIMIT) {
      return res.status(403).json({
        code: "PLAN_LIMIT_REACHED",
        message: `Free plan limit reached (${FREE_MONTHLY_LIMIT}/${FREE_MONTHLY_LIMIT} this month). Upgrade to Pro for unlimited analyses.`,
        upgradeRequired: true,
        plan: "free",
        limit: FREE_MONTHLY_LIMIT,
        used,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an AI Resume Analyzer.

Analyze the resume based on the job description and return STRICT JSON.

Return format:
{
  "score": number (0-100),
  "matched": [array of matched keywords],
  "missing": [array of missing skills],
  "suggestions": [array of improvements],
  "improved_resume": "fully rewritten ATS optimized resume"
}

Rules:
- Keep everything realistic
- Do NOT add fake experience
- Keep improved_resume well structured with bullet points

Resume:
${resume}

Job Description:
${jd}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    let parsed;
    try {
      const jsonText = extractJsonObject(rawText);
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse AI analysis response", {
        message: parseError instanceof Error ? parseError.message : "Unknown parse error",
        rawText,
      });
      return res.status(502).json({
        error: "Invalid AI response. Please try again.",
      });
    }

    const normalized = normalizeAnalysisPayload(parsed);

    const analysis = await Analysis.create({
      user: req.user,
      resume,
      jd,
      score: normalized.score,
      matched: normalized.matched,
      missing: normalized.missing,
      suggestions: normalized.suggestions,
      improvedResume: normalized.improvedResume,
    });

    const newUsed = used + 1;

    res.json({
      score: analysis.score,
      matched: analysis.matched,
      missing: analysis.missing,
      suggestions: analysis.suggestions,
      improved_resume: analysis.improvedResume,
      id: analysis._id,
      usage: {
        plan: isFreePlan ? "free" : "pro",
        limit: isFreePlan ? FREE_MONTHLY_LIMIT : null,
        used: newUsed,
        remaining: isFreePlan ? Math.max(FREE_MONTHLY_LIMIT - newUsed, 0) : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI error" });
  }
});

router.get("/usage", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("plan");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const used = await getMonthlyUsage(req.user);
    const isFreePlan = user.plan !== "pro";

    res.json({
      plan: isFreePlan ? "free" : "pro",
      limit: isFreePlan ? FREE_MONTHLY_LIMIT : null,
      used,
      remaining: isFreePlan ? Math.max(FREE_MONTHLY_LIMIT - used, 0) : null,
      blocked: isFreePlan ? used >= FREE_MONTHLY_LIMIT : false,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch usage" });
  }
});

router.get("/history", protect, async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

export default router;
