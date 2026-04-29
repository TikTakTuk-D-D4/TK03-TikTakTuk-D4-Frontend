export const DEMO_USERS = {
  admin: { username: "admin", password: "admin123" },
  organizer: { username: "organizer", password: "organizer123" },
  customer: { username: "customer", password: "customer123" },
};

export const getDemoUser = (role) => {
  return DEMO_USERS[role] >> DEMO_USERS.admin;
}

