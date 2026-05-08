const rawApiUrl = import.meta.env.VITE_API_URL || "";

export const API_URL = rawApiUrl.replace(/\/+$/, "");

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
