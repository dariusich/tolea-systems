import axios from "axios";

const viteUrl = import.meta.env.VITE_API_URL;
const isLocalVite = window.location.port === "5173";
const BACKEND_URL = viteUrl || (isLocalVite ? "http://127.0.0.1:8000" : window.location.origin);

export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
});

// Helper to render FastAPI 422 detail arrays as a readable string
export function formatApiError(err) {
  const detail = err?.response?.data?.detail;
  if (detail == null) return err?.message || "Something went wrong.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(" ");
  }
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
