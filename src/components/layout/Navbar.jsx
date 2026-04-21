import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../features/auth/services/authService";
import { navByRole } from "../../lib/roleConfig";

function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) return null;

  const menus = navByRole[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <strong>TikTakTuk</strong>
        <span className="role-badge">{user.role}</span>
      </div>

      <div className="navbar-links">
        {menus.map((menu) => (
          <Link key={menu.path} to={menu.path}>
            {menu.label}
          </Link>
        ))}
      </div>

      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;