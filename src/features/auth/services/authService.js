const STORAGE_KEY = "tiktaktuk_user";

export function loginAs(role) {
  const user = {
    username: `${role}_demo`,
    role,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}