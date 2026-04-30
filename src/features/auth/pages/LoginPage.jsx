import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getCurrentUser, loginAs } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      loginAs(role);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <section className="auth-screen">
      <div className="hero-pane">
        <div className="brand">
          <div className="brand-mark">TT</div>
          <div>
            <div className="brand-word">TikTakTuk</div>
            <div className="brand-sub">Concert Ticketing Platform</div>
          </div>
        </div>

        <div className="hero-copy">
          <h1>Frontend TK03 untuk alur ticket dan seat.</h1>
          <p>
            Pilih role demo untuk menguji akses ke Manajemen Kursi, Manajemen Tiket, dan Tiket Saya
            tanpa backend.
          </p>
          <span className="hero-pill">Dark neon purple design system enabled</span>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <b>3</b>
            <span>Demo roles</span>
          </div>
          <div className="meta-card">
            <b>15</b>
            <span>Dummy seats</span>
          </div>
          <div className="meta-card">
            <b>5</b>
            <span>Issued tickets</span>
          </div>
        </div>
      </div>

      <div className="auth-pane">
        <div className="auth-head">
          <h2>Login Demo</h2>
          <p>Masuk cepat untuk memeriksa flow frontend sesuai role.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-picker">
            {["admin", "organizer", "customer"].map((item) => (
              <button
                className={`role-opt${role === item ? " active" : ""}`}
                key={item}
                type="button"
                onClick={() => setRole(item)}
              >
                <span className="role-icon">{item === "admin" ? "A" : item === "organizer" ? "O" : "C"}</span>
                <span>{item}</span>
              </button>
            ))}
          </div>

          <button className="btn btn-primary" type="submit">
            Masuk sebagai {role}
          </button>

          {error ? <span className="form-error">{error}</span> : null}
        </form>

        <p className="linkline">
          Belum perlu registrasi untuk TK03. <Link to="/register">Lihat halaman register</Link>.
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
