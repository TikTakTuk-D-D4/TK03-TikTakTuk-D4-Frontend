import { clsx } from "clsx";
import { useAuth } from "../../../context/AuthContext";

const ROLES = ["guest", "customer", "organizer", "admin"];

export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const currentRole = user?.role ?? "guest";

  return (
    <div className="flex bg-card border border-edge rounded-[10px] p-1 gap-0.5">
      {ROLES.map((role) => (
        <button
          key={role}
          type="button"
          onClick={() => switchRole(role)}
          className={clsx(
            "px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide rounded-[7px] transition",
            currentRole === role
              ? "bg-primary text-bg shadow-btn-primary"
              : "text-ink-mute hover:text-ink"
          )}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
