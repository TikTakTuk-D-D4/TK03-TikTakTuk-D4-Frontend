import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { navByRole } from "../../lib/roleConfig";

function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menus = navByRole[user.role] || [];

  return (
    <aside className="w-64 flex flex-col border-r border-edge bg-card shadow-sm z-20 flex-shrink-0">
      <div className="h-16 px-6 flex items-center border-b border-edge shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2 group outline-none focus-visible:ring focus-visible:ring-primary rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-display font-bold shadow-btn-primary transition-transform group-hover:scale-105">
            T&middot;
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-ink group-hover:text-primary transition-colors">
            TikTakTuk
          </span>
        </Link>
      </div>

      <div className="p-4 shrink-0 border-b border-edge">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-soft flex flex-col items-center justify-center text-primary font-bold overflow-hidden shadow-inner">
            {user.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col max-w-full overflow-hidden">
            <span className="text-sm font-semibold truncate leading-tight text-ink">
              {user.username || "Guest User"}
            </span>
            <span className="text-xs text-ink-mute capitalize truncate">
              {user.role} Account
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 custom-scrollbar">
        {menus.map((menu) => {
          const active = location.pathname.startsWith(menu.path);
          return (
            <Link
              key={menu.path}
              to={menu.path}
              className={[
                "px-3 py-2.5 rounded-lg text-[14px] font-medium flex items-center transition-all outline-none focus-visible:ring focus-visible:ring-primary",
                active 
                  ? "bg-primary-soft text-primary shadow-sm"
                  : "text-ink-dim hover:bg-bg-soft hover:text-ink hover:translate-x-0.5",
              ].join(" ")}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-edge mt-auto text-xs text-ink-mute text-center font-mono">
        &copy; 2026 Admin Panel
      </div>
    </aside>
  );
}

export default Sidebar;
