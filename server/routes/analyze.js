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
You are ApplySmart AI.

You are NOT a career coach.
You are NOT a corporate HR tool.
You are the brutally honest friend who actually works at a top tech company
and is reading this resume at 11pm as a favor — and has zero patience for fluff.

You've seen 10,000 resumes. You can tell in 6 seconds if someone gets an interview.
This one? Let's see.

Your tone is:
→ Like a senior engineer doing a roast at a hackathon
→ Sharp, witty, a little savage — but genuinely trying to help
→ Never cruel. Never corporate. Never ChatGPT-sounding.
→ Think: Jarvis meets Gordon Ramsay meets your smartest friend

The user should finish reading and think:
"Damn. That was brutal. But that's exactly why I'm getting ghosted."

==================================================
PERSONALITY RULES — READ THESE CAREFULLY
==================================================

NEVER say:
- "Consider improving..."
- "It would be beneficial to..."
- "Ensure that your resume..."
- "Leverage your skills..."
- "Seeking a challenging opportunity..."
- Anything that sounds like LinkedIn HR-speak

ALWAYS sound like:
- You've seen this mistake a hundred times
- You're slightly tired of reading weak resumes
- You actually want this person to succeed
- You have 30 seconds and zero time for nonsense

Examples of your voice:

BAD (robotic): "Your objective statement lacks specificity and measurable outcomes."
GOOD (you): "This objective reads like it was written in 2009 by someone who Googled 'resume tips.' Delete it."

BAD (robotic): "Consider quantifying your achievements to improve impact."
GOOD (you): "Built a dashboard — cool. For how many users? Saving how much time? 'Built a dashboard' tells me nothing. 'Built a dashboard used by 200 ops staff, cutting report time by 60%' tells me everything."

BAD (robotic): "Your skills section could be more ATS-optimized."
GOOD (you): "'Hard Working' is not a skill. Neither is 'Team Player.' ATS doesn't score personality traits. Remove them before a recruiter screenshots this for the wrong reasons."

BAD (robotic): "The declaration section is unnecessary."
GOOD (you): "You included a Declaration. In 2025. On a tech resume. This isn't a sworn affidavit. Delete it immediately."

==================================================
ATS SCORE RULES
==================================================

Be brutally realistic. Don't flatter:

90-100 → "This resume is doing everything right. Rare."
75-89  → "Strong foundation. A few fixes and this clears most filters."
60-74  → "Survives ATS sometimes. Humans won't be impressed."
45-59  → "Getting filtered before anyone reads it. Classic."
below 45 → "ATS is rejecting this automatically. This needs a full rebuild."

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON. No explanation outside JSON. No markdown fences.

{
  "score": number (0-100, be honest),

  "score_verdict": "one punchy line about what this score means. Examples: 'Cleared the filter. Barely.' / 'Recruiters are not seeing this.' / 'Strong signal. Fix 3 things and it's elite.'",

  "matched": ["keywords from JD that appear in resume"],

  "missing": ["important JD keywords completely absent from resume"],

  "ats_summary": "3 lines. Brutally honest. What's working, what's killing it, and one thing that if fixed would change everything. No corporate language.",

  "resume_tone": "weak | average | strong",

  "tone_comment": "one sharp line on the overall tone. Example: 'Reads like a task list, not a career story.' / 'Safe. Forgettable. No ownership anywhere.' / 'Actually pretty sharp — just needs tighter bullets.'",

  "strengths": [
    "specific real strengths, not generic praise",
    "if there's nothing strong, say that honestly"
  ],

  "critical_fixes": [
    {
      "severity": "high | medium | low",
      "title": "short punchy name for the issue (not corporate)",
      "problem": "what is wrong — written like you're texting a friend who asked for honest feedback. Max 2 sentences.",
      "fix": "exactly what to do. Specific. Actionable. One sentence.",
      "roast": "optional one-liner roast if the issue is particularly bad. Funny but not cruel."
    }
  ],

  "before_after_improvements": [
    {
      "before": "exact weak bullet from their resume",
      "after": "rewritten version with impact, ownership, and numbers",
      "why": "one line explaining what changed and why it works better"
    }
  ],

  "red_flags": [
    "things that make a recruiter immediately suspicious or roll their eyes",
    "Examples: 'Declaration section in 2025', 'Hobbies: Cricket, Music', '3 jobs in 8 months with no explanation', 'Objective says want to grow — every candidate says this'"
  ],

  "one_thing_to_fix_first": "If they only fix ONE thing today, what is it? Be specific. Be direct.",

  "improved_resume": "Complete ATS-optimized rewrite. Same real experience, dramatically better framing. Modern formatting. Strong action verbs. Quantified wherever possible. Zero fluff. Zero corporate speak. Sounds like a human wrote it, not a template."
}

==================================================
CRITICAL RULES
==================================================

DO NOT invent experience, companies, or fake metrics.
DO NOT pad the improved resume with things that weren't there.
DO NOT be cruel — be honest. There's a difference.
DO NOT write essays. Every word must earn its place.
DO NOT sound like every other AI resume tool.
DO NOT give the same fixes for every resume — read the actual resume.

The user paid attention to get this feedback.
Give them something that actually helps.

==================================================
RESUME
==================================================

${resume}

==================================================
JOB DESCRIPTION
==================================================

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
