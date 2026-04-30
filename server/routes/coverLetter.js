import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import CoverLetter from "../models/CoverLetter.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const FREE_MONTHLY_LIMIT = 5;

function getCurrentMonthBounds() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { startOfMonth, startOfNextMonth };
}

async function getMonthlyUsage(userId) {
  const { startOfMonth, startOfNextMonth } = getCurrentMonthBounds();
  return CoverLetter.countDocuments({
    user: userId,
    createdAt: { $gte: startOfMonth, $lt: startOfNextMonth },
  });
}

function isRetryableGeminiError(error) {
  const status = error?.status ?? error?.statusCode ?? error?.response?.status;
  const message = typeof error?.message === "string" ? error.message : "";
  return status === 503 || message.includes("503") || message.toLowerCase().includes("unavailable");
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

router.post("/generate", protect, async (req, res) => {
  try {
    const { resume, jd } = req.body;

    if (typeof resume !== "string" || typeof jd !== "string" || !resume.trim() || !jd.trim()) {
      return res.status(400).json({
        error: "Resume and job description are required",
      });
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
        message: `Free plan limit reached (${FREE_MONTHLY_LIMIT}/${FREE_MONTHLY_LIMIT} cover letters this month). Upgrade to Pro for unlimited generations.`,
        upgradeRequired: true,
        plan: "free",
        limit: FREE_MONTHLY_LIMIT,
        used,
      });
    }

    const prompt = `
You are an expert career writing assistant.

Task:
- Analyze the job description carefully.
- Match the strongest, real qualifications from the candidate resume.
- Write a personalized cover letter between 250 and 300 words.

Rules:
- Use a professional, polished, and human tone.
- Sound specific and confident, not generic or robotic.
- Only mention skills, achievements, tools, and experiences that are supported by the resume.
- Do not hallucinate qualifications, metrics, certifications, employers, or projects.
- Make the letter clearly aligned to the job description.
- Keep it ready to send with a greeting, body, and closing.
- Return only the final cover letter text with no markdown fences or notes.

Resume:
${resume.trim()}

Job Description:
${jd.trim()}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const coverLetter = await generateWithRetry(model, prompt);

    if (!coverLetter) {
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

    const newUsed = used + 1;

    res.json({
      coverLetter: savedCoverLetter.content,
      id: savedCoverLetter._id,
      usage: {
        plan: isFreePlan ? "free" : "pro",
        limit: isFreePlan ? FREE_MONTHLY_LIMIT : null,
        used: newUsed,
        remaining: isFreePlan ? Math.max(FREE_MONTHLY_LIMIT - newUsed, 0) : null,
      },
    });
  } catch (error) {
    console.error("Cover letter generation failed", error);

    if (isRetryableGeminiError(error)) {
      return res.status(503).json({
        error: "Gemini is temporarily unavailable. Please try again in a moment.",
      });
    }

    res.status(500).json({ error: "Failed to generate cover letter" });
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
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch usage" });
  }
});

export default router;
