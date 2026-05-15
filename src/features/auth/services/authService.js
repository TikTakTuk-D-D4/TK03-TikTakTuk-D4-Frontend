import { parseJsonSafe } from "../../../lib/api";

const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_KEY = "tiktaktuk_user";

export async function loginWithCredentials({ username = "", password = "" } = {}) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || "Username atau password salah.");
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
  window.dispatchEvent(new CustomEvent("tiktaktuk:user", { detail: data.user }));
  return data.user;
}

export async function registerUser({
  username,
  password,
  role,
  full_name,
  phone_number,
  organizer_name,
  contact_email,
} = {}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role, full_name, phone_number, organizer_name, contact_email }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || "Registrasi gagal.");
  return data;
}

export async function updateProfile({
  user_id,
  full_name,
  phone_number,
  organizer_name,
  contact_email,
} = {}) {
  const res = await fetch(`${API_URL}/auth/profile/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, phone_number, organizer_name, contact_email }),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.message || "Update profil gagal.");
  const current = getCurrentUser();
  const updated = { ...current, full_name };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("tiktaktuk:user", { detail: updated }));
  return updated;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdminOrOrganizer() {
  const user = getCurrentUser();
  return user?.role === "administrator" || user?.role === "organizer";
}

export function getPageUser() {
  return getCurrentUser();
}

export function updateCurrentUser(patch = {}) {
  const current = getCurrentUser();
  const next = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("tiktaktuk:user", { detail: next }));
  return next;
}

export function loginAs() {}
export function getDemoUsers() { return {}; }
export function updateUserPassword() { return { ok: false }; }
