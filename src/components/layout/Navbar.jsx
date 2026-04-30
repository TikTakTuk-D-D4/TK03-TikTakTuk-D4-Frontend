import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getPageUser, logout } from "../../features/auth/services/authService";
import { navByRole } from "../../lib/roleConfig";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getPageUser());
  const menus = navByRole[user.role] || [];

  useEffect(() => {
    const handleUserUpdate = (event) => {
      setUser(event?.detail || getPageUser());
    };

    window.addEventListener("tiktaktuk:user", handleUserUpdate);
    return () => window.removeEventListener("tiktaktuk:user", handleUserUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/dashboard");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="brand-mark">TT</div>
        <div>
          <strong>TikTakTuk</strong>
          <span className="role-badge">{user.role}</span>
        </div>
      </div>

      <div className="navbar-links">
        {menus.map((menu) => (
          <NavLink
            key={menu.path}
            to={menu.path}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {menu.label}
          </NavLink>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-chip">
          <span>{user.name || user.username}</span>
        </div>
        <button className="btn btn-danger btn-sm" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;


