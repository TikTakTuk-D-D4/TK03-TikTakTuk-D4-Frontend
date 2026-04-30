const STORAGE_KEY = "tiktaktuk_user";

const demoUsers = {
  admin: {
    user_id: "usr-admin-001",
    username: "admin_demo",
    name: "Alya Admin",
    role: "admin",
  },
  organizer: {
    user_id: "usr-org-001",
    username: "organizer_demo",
    name: "Raka Organizer",
    role: "organizer",
    organizer_id: "org-001",
  },
  customer: {
    user_id: "usr-cust-001",
    username: "customer_demo",
    name: "Budi Santoso",
    role: "customer",
    customer_id: "cust-001",
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