import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

function Navbar() {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b border-edge bg-card shadow-[0_2px_12px_rgba(20,37,63,0.03)] z-10 shrink-0 transition-all">
      <div className="flex items-center gap-4 text-ink-dim">
        <div className="font-semibold text-lg text-ink font-display capitalize tracking-tight flex items-center">
          <span className="hidden sm:inline-block mr-2 w-1.5 h-1.5 rounded-full bg-success"></span>
          Role Active: <span className="ml-1 text-primary">{user.role}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-bg-soft text-ink-mute text-sm font-medium border border-edge">
          <span className="font-mono text-xs">Session Valid</span>
        </div>
        
        <Button variant="danger" className="text-sm px-4 py-1.5 rounded-lg font-medium tracking-wide shadow-sm" onClick={handleLogout}>
          Logout 
        </Button>
      </div>
    </nav>
  );
}

export default Navbar;


