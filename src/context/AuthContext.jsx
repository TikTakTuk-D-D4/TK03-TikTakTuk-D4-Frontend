import { createContext, useContext, useMemo, useState } from "react";
import { getCurrentUser, logout, loginWithCredentials } from "../features/auth/services/authService";

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;
  const role = user.role === "administrator" ? "admin" : user.role;
  return {
    id: user.user_id || user.id,
    name: user.full_name || user.organizer_name || user.username,
    username: user.username,
    role,
    user_id: user.user_id || user.id,
    organizer_id: user.organizer_id,
    organizer_name: user.organizer_name,
    customer_id: user.customer_id,
    full_name: user.full_name,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(getCurrentUser()));

  const login = async ({ username, password }) => {
    const raw = await loginWithCredentials({ username, password });
    const normalized = normalizeUser(raw);
    setUser(normalized);
    return normalized;
  };

  const switchRole = (role) => {
    if (role === "guest") {
      logout();
      setUser(null);
    }
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, setUser, switchRole, logoutUser, login }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus dipakai di dalam AuthProvider");
  }
  return context;
}
