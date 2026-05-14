const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tiktaktuk_user";

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
