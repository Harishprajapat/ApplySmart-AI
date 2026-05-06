import AIHistory from "../models/AIHistory.js";

export const AI_HISTORY_TYPES = {
  resume: "resume",
  coverLetter: "cover_letter",
};

export function createResumeHistoryPayload({
  userId,
  atsScore,
  matchedSkills = [],
  missingSkills = [],
  suggestions = [],
  content = "",
}) {
  return {
    userId,
    type: AI_HISTORY_TYPES.resume,
    title: `${atsScore}% Match`,
    data: {
      atsScore,
      matchedSkills,
      missingSkills,
      suggestions,
      content,
    },
  };
}

export function createCoverLetterHistoryPayload({ userId, content }) {
  return {
    userId,
    type: AI_HISTORY_TYPES.coverLetter,
    title: "Cover Letter Generated",
    data: {
      atsScore: null,
      matchedSkills: [],
      missingSkills: [],
      suggestions: [],
      content,
    },
  };
}

export async function createAIHistoryEntry(payload) {
  return AIHistory.create(payload);
}

export async function listAIHistory({
  userId,
  limit,
  skip = 0,
  type,
}) {
  const query = { userId };

  if (type) {
    query.type = type;
  }

  const items = await AIHistory.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AIHistory.countDocuments(query);

  return {
    items,
    pagination: {
      total,
      limit,
      skip,
      hasMore: skip + items.length < total,
    },
  };
}
