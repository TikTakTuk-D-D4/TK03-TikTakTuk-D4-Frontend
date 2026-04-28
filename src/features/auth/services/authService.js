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

export function loginAs(role) {
  const user = demoUsers[role];

  if (!user) {
    throw new Error(`Unknown role: ${role}`);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function getDemoUsers() {
  return demoUsers;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
