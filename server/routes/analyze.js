import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Analysis from "../models/Analysis.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkUsageLimit } from "../middleware/checkUsageLimit.js";
import {
  createAIHistoryEntry,
  createResumeHistoryPayload,
} from "../utils/aiHistoryService.js";
import {
  USAGE_FIELDS,
  USAGE_LIMITS,
  buildUsagePayload,
  syncUsage,
} from "../utils/usageService.js";

const router = express.Router();
const AI_RATE_LIMIT_RETRY_AFTER_SECONDS = 60;

function isRetryableGeminiError(error) {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  const message = typeof error?.message === "string" ? error.message : "";

  return (
    status === 429 ||
    status === 503 ||
    message.includes("429") ||
    message.includes("503") ||
    message.toLowerCase().includes("unavailable") ||
    message.toLowerCase().includes("rate limit")
  );
}

function parseRetryDelaySeconds(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d+(?:\.\d+)?)s$/i);
  if (!match) {
    return null;
  }

  return Math.ceil(Number.parseFloat(match[1]));
}

function extractGeminiRetryAfterSeconds(error) {
  const errorDetails = Array.isArray(error?.errorDetails) ? error.errorDetails : [];

  for (const detail of errorDetails) {
    const retryDelay = parseRetryDelaySeconds(detail?.retryDelay);
    if (retryDelay !== null) {
      return Math.max(retryDelay, AI_RATE_LIMIT_RETRY_AFTER_SECONDS);
    }
  }

  const message = typeof error?.message === "string" ? error.message : "";
  const retryMatch = message.match(/retry in\s+(\d+(?:\.\d+)?)s/i);

  if (retryMatch) {
    return Math.max(Math.ceil(Number.parseFloat(retryMatch[1])), AI_RATE_LIMIT_RETRY_AFTER_SECONDS);
  }

  return AI_RATE_LIMIT_RETRY_AFTER_SECONDS;
}

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

function validateAnalyzeRequest(req, res, next) {
  const { resume, jd } = req.body;

  if (!resume || !jd) {
    return res.status(400).json({ error: "Resume and job description are required" });
  }

  next();
}

function ensureGeminiApiKey(req, res, next) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Missing Gemini API key. Set GEMINI_API_KEY in server/.env.",
    });
  }

  req.geminiApiKey = apiKey;
  next();
}

async function rollbackReservedUsage(req) {
  if (typeof req.releaseUsageReservation === "function") {
    try {
      await req.releaseUsageReservation();
    } catch (rollbackError) {
      console.error("Failed to rollback reserved analysis usage", rollbackError);
    }
  }
}

router.post("/", protect, validateAnalyzeRequest, ensureGeminiApiKey, checkUsageLimit, async (req, res) => {
  let shouldRollbackUsage = true;

  try {
    const { resume, jd } = req.body;
    const apiKey = req.geminiApiKey;

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
      await rollbackReservedUsage(req);
      shouldRollbackUsage = false;
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

    try {
      await createAIHistoryEntry(
        createResumeHistoryPayload({
          userId: req.user,
          atsScore: normalized.score,
          matchedSkills: normalized.matched,
          missingSkills: normalized.missing,
          suggestions: normalized.suggestions,
          content: normalized.improvedResume,
        }),
      );
    } catch (historyError) {
      console.error("Failed to record resume AI history", historyError);
    }

    shouldRollbackUsage = false;
    const usage = buildUsagePayload(
      req.usageUser,
      USAGE_FIELDS.analysis,
      USAGE_LIMITS.analysis,
    );

    res.json({
      score: analysis.score,
      matched: analysis.matched,
      missing: analysis.missing,
      suggestions: analysis.suggestions,
      improved_resume: analysis.improvedResume,
      id: analysis._id,
      usage,
    });
  } catch (err) {
    console.error(err);

    if (shouldRollbackUsage) {
      await rollbackReservedUsage(req);
    }

    if (isRetryableGeminiError(err)) {
      const retryAfter = extractGeminiRetryAfterSeconds(err);

      return res.status(429).json({
        code: "AI_RATE_LIMIT",
        message: "High demand right now. Please retry after the cooldown window.",
        retryAfter,
      });
    }

    res.status(500).json({ error: "AI error" });
  }
});

router.get("/usage", protect, async (req, res) => {
  try {
    const user = await syncUsage(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(buildUsagePayload(user, USAGE_FIELDS.analysis, USAGE_LIMITS.analysis));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch usage" });
  }
});

export default router;
