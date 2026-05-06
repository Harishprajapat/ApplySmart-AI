export type AIHistoryType = "resume" | "cover_letter";

export type AIHistoryItem = {
  _id: string;
  userId: string;
  type: AIHistoryType;
  title: string;
  data: {
    atsScore: number | null;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    content: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type AIHistoryResponse = {
  items: AIHistoryItem[];
  pagination: {
    total: number;
    limit: number;
    skip: number;
    hasMore: boolean;
  };
};

type FetchHistoryOptions = {
  limit?: number;
  skip?: number;
  type?: AIHistoryType;
};

export async function fetchAIHistory(token: string, options: FetchHistoryOptions = {}) {
  const params = new URLSearchParams();

  if (typeof options.limit === "number") {
    params.set("limit", String(options.limit));
  }

  if (typeof options.skip === "number") {
    params.set("skip", String(options.skip));
  }

  if (options.type) {
    params.set("type", options.type);
  }

  const query = params.toString();
  const response = await fetch(`http://localhost:5000/api/history${query ? `?${query}` : ""}`, {
    headers: {
      Authorization: token,
    },
  });

  const data = (await response.json()) as Partial<AIHistoryResponse> & {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to fetch history");
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: data.pagination || {
      total: 0,
      limit: options.limit ?? 50,
      skip: options.skip ?? 0,
      hasMore: false,
    },
  } satisfies AIHistoryResponse;
}

export function getAIHistoryTypeLabel(type: AIHistoryType) {
  return type === "resume" ? "Resume" : "Cover Letter";
}

export function getAIHistoryPreview(item: AIHistoryItem) {
  const content = item.data.content?.trim();

  if (content) {
    return content.length > 180 ? `${content.slice(0, 177)}...` : content;
  }

  if (item.type === "resume" && item.data.matchedSkills.length) {
    return `Matched skills: ${item.data.matchedSkills.slice(0, 4).join(", ")}`;
  }

  return item.type === "resume"
    ? "ATS analysis completed with skill gap insights."
    : "Cover letter generated successfully.";
}

export function buildAIHistoryCopyText(item: AIHistoryItem) {
  if (item.type === "cover_letter") {
    return item.data.content || item.title;
  }

  return [
    item.title,
    item.data.atsScore != null ? `ATS Score: ${item.data.atsScore}%` : null,
    item.data.matchedSkills.length ? `Matched Skills: ${item.data.matchedSkills.join(", ")}` : null,
    item.data.missingSkills.length ? `Missing Skills: ${item.data.missingSkills.join(", ")}` : null,
    item.data.suggestions.length ? `Suggestions: ${item.data.suggestions.join(" | ")}` : null,
    item.data.content ? `Improved Resume:\n${item.data.content}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}
