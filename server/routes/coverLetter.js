import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import CoverLetter from "../models/CoverLetter.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkCoverLimit } from "../middleware/checkCoverLimit.js";
import {
  USAGE_FIELDS,
  USAGE_LIMITS,
  buildUsagePayload,
  syncUsage,
} from "../utils/usageService.js";


const router = express.Router();

function isRetryableGeminiError(error) {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  const message = typeof error?.message === "string" ? error.message : "";
  return (
    status === 503 ||
    message.includes("503") ||
    message.toLowerCase().includes("unavailable")
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithRetry(model, prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    if (!isRetryableGeminiError(error)) {
      throw error;
    }

    await wait(1200);
    const retryResult = await model.generateContent(prompt);
    const retryResponse = await retryResult.response;
    return retryResponse.text().trim();
  }
}

async function rollbackReservedUsage(req) {
  if (typeof req.releaseUsageReservation === "function") {
    try {
      await req.releaseUsageReservation();
    } catch (rollbackError) {
      console.error("Failed to rollback reserved cover letter usage", rollbackError);
    }
  }
}

router.post(
  "/generate",
  protect,
  checkCoverLimit,
  async (req, res) => {
    let shouldRollbackUsage = true;

    try {
      const { resume, jd } = req.body;

      if (
        typeof resume !== "string" ||
        typeof jd !== "string" ||
        !resume.trim() ||
        !jd.trim()
      ) {
        await rollbackReservedUsage(req);
        shouldRollbackUsage = false;
        return res.status(400).json({
          error: "Resume and job description are required",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      if (!apiKey) {
        await rollbackReservedUsage(req);
        shouldRollbackUsage = false;
        return res.status(500).json({
          error: "Missing Gemini API key. Set GEMINI_API_KEY in server/.env.",
        });
      }

      const prompt = `
You are an expert career coach who writes cover letters that get interviews.

Write a cover letter using the resume and job description below.

STRICT RULES — follow every one:
1. Maximum 3 paragraphs. No more. Total length: 250–320 words.
2. Paragraph 1: Open with a specific achievement or project from the resume that directly relates to the JD. Not "I am writing to..." — skip that entirely.
3. Paragraph 2: Pick the 2 most relevant technical skills or projects from the resume that match the JD requirements. Connect them explicitly. Do not list everything.
4. Paragraph 3 (closing — 3 sentences max):
- Sentence 1: Reference ONE specific thing from the job description itself
  (a technology, a responsibility, a team structure, or a product they mentioned).
  Not a generic compliment about the company culture.
- Sentence 2: State what you will bring, using "I will" — not "I hope to",
  "I am eager to", or "I am excited by". Be direct.
- Sentence 3: "I'd welcome the opportunity to discuss this further."
  Nothing more. Clean close.

BANNED words and phrases in the entire letter (add to your existing list):
- "eager"
- "excited by the prospect"
- "contribute significantly"  
- "ideal setting"
- "collaborative environment" (unless it's a direct quote from the JD)
- "innovative team"
5. Tone: confident, direct, human. Not formal, not robotic, not desperate.
6. Do NOT use these phrases: "I am writing to", "enthusiastic interest", "eager to contribute", "passion for", "I am excited by the prospect".
7. Address: "Dear Hiring Manager," — keep this.
8. Sign off: "Sincerely," then the candidate's full name from the resume.

Resume:
${resume.trim()}


Job Description:
${jd.trim()}

Return only the cover letter text. No explanation, no preamble.

`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const coverLetter = await generateWithRetry(model, prompt);

      if (!coverLetter) {
        await rollbackReservedUsage(req);
        shouldRollbackUsage = false;
        return res.status(502).json({
          error: "Empty AI response. Please try again.",
        });
      }

      const savedCoverLetter = await CoverLetter.create({
        user: req.user,
        resume: resume.trim(),
        jd: jd.trim(),
        content: coverLetter,
      });

      shouldRollbackUsage = false;
      const usage = buildUsagePayload(
        req.usageUser,
        USAGE_FIELDS.coverLetter,
        USAGE_LIMITS.coverLetter,
      );

      res.json({
        coverLetter: savedCoverLetter.content,
        id: savedCoverLetter._id,
        usage,
      });
    } catch (error) {
      if (shouldRollbackUsage) {
        await rollbackReservedUsage(req);
      }

      console.error("Cover letter generation failed", error);

      if (isRetryableGeminiError(error)) {
        return res.status(503).json({
          error:
            "Gemini is temporarily unavailable. Please try again in a moment.",
        });
      }

      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  },
);

router.get("/usage", protect, async (req, res) => {
  try {
    const user = await syncUsage(req.user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(buildUsagePayload(user, USAGE_FIELDS.coverLetter, USAGE_LIMITS.coverLetter));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch usage" });
  }
});

export default router;
