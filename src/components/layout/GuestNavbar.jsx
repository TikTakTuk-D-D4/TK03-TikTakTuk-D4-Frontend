import { NavLink } from "react-router-dom";

function GuestNavbar() {
  return (
    <nav className="navbar guest-navbar">
      <div className="navbar-brand">
        <div className="brand-mark">TT</div>
        <div>
          <strong>TikTakTuk</strong>
          <span className="role-badge">guest</span>
        </div>
      </div>

      <div className="navbar-links">
        <NavLink
          to="/login"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Login
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
        >
          Registrasi
        </NavLink>
      </div>
    </nav>
  );
}

export default GuestNavbar;
