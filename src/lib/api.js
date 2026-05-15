const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tiktaktuk_user";

export async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getAuthHeaders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const user = raw ? JSON.parse(raw) : null;
    if (user?.user_id) return { "x-user-id": user.user_id };
  } catch {}
  return {};
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return res;
}

export { API_URL };
