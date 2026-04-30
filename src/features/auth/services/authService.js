const STORAGE_KEY = "tiktaktuk_user";
const DEFAULT_PASSWORD = "demo123";

const demoUsers = {
  admin: {
    user_id: "usr-admin-001",
    username: "admin_demo",
    name: "Alya Admin",
    role: "admin",
    password: DEFAULT_PASSWORD,
  },
  organizer: {
    user_id: "usr-org-001",
    username: "organizer_demo",
    name: "Raka Organizer",
    role: "organizer",
    organizer_id: "org-001",
    password: DEFAULT_PASSWORD,
  },
  customer: {
    user_id: "usr-cust-001",
    username: "customer_demo",
    name: "Budi Santoso",
    role: "customer",
    customer_id: "cust-001",
    password: DEFAULT_PASSWORD,
  },
};

// Login using demo users (fallback to simple role if needed)
export function loginAs(role = "admin") {
  const user =
    demoUsers[role] || {
      username: `${role}_demo`,
      role,
    };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function getDemoUsers() {
  return demoUsers;
}

// Logout
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

// Get current user safely
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing user:", error);
    return null;
  }
}

// Admin / organizer only
export function isAdminOrOrganizer() {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.role === "organizer";
}

// Fallback for pages
export function getPageUser() {
  return getCurrentUser() || demoUsers.admin;
}

export function updateCurrentUser(patch = {}) {
  const current = getCurrentUser() || demoUsers.admin;
  const next = {
    ...current,
    ...patch,
  };

  if (!next.password) {
    next.password = current.password || DEFAULT_PASSWORD;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("tiktaktuk:user", { detail: next }));
  return next;
}

export function updateUserPassword({ currentPassword = "", nextPassword = "" } = {}) {
  const current = getCurrentUser() || demoUsers.admin;
  const storedPassword = current.password || DEFAULT_PASSWORD;

  if (!currentPassword) {
    return { ok: false, error: "Password lama wajib diisi." };
  }

  if (currentPassword !== storedPassword) {
    return { ok: false, error: "Password lama tidak sesuai." };
  }

  const updated = {
    ...current,
    password: nextPassword,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("tiktaktuk:user", { detail: updated }));
  return { ok: true, user: updated };
}