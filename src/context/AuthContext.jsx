import { createContext, useContext, useMemo, useState } from "react";
import { getCurrentUser, loginAs, logout } from "../features/auth/services/authService";

const AuthContext = createContext(null);

const PRESETS = {
  admin: { id: "adm01", name: "Admin TikTakTuk", role: "admin" },
  organizer: { id: "org01", name: "Bagas Production", role: "organizer" },
  customer: { id: "cust01", name: "Andini Pertiwi", role: "customer" },
  guest: null,
};

function normalizeUser(user) {
  if (!user) return null;
  if (user.id && user.name) return user;
  return PRESETS[user.role] || null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(getCurrentUser()));

  const switchRole = (role) => {
    if (role === "guest") {
      logout();
      setUser(null);
      return;
    }

    loginAs(role);
    setUser(PRESETS[role] || null);
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, switchRole, logoutUser }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}
