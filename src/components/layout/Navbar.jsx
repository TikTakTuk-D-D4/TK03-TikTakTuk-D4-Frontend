import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getPageUser, logout } from "../../features/auth/services/authService";
import { navByRole } from "../../lib/roleConfig";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getPageUser());
  const menus = navByRole[user.role] || [];
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleUserUpdate = (event) => {
      setUser(event?.detail || getPageUser());
    };

    window.addEventListener("tiktaktuk:user", handleUserUpdate);
    return () => window.removeEventListener("tiktaktuk:user", handleUserUpdate);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
            key={menu.label}
            to={menu.path}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {menu.label}
          </NavLink>
        ))}
      </div>

      {user.role === "customer" ? (
        <div className="navbar-user">
          <button className="nav-link" type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="navbar-user" ref={profileRef}>
          <button
            className="profile-menu-btn"
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
          >
            <span className="user-chip">{user.name || user.username}</span>
            <span className="profile-caret">Profile</span>
          </button>
          {profileOpen ? (
            <div className="profile-menu-panel">
              <button
                className="profile-menu-item"
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/profile");
                }}
              >
                Profil Saya
              </button>
              <button
                className="profile-menu-item danger"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      )}
    </nav>
  );
}

export default Navbar;


