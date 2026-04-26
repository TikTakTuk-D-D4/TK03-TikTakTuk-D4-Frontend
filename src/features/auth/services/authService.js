const STORAGE_KEY = "tiktaktuk_user";

// Login dummy berdasarkan role
export function loginAs(role = "admin") {
  const user = {
    username: `${role}_demo`,
    role,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

// Logout
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

// Ambil user dari localStorage
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
}
export function isAdminOrOrganizer() {
  return true;
}