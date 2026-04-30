import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { loginAs } from "../services/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("admin_demo");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const roleOptions = [
    {
      value: "admin",
      label: "Admin",
      icon: "🛡️",
      hint: "Kelola sistem, tiket, promo, dan data utama.",
    },
    {
      value: "organizer",
      label: "Organizer",
      icon: "🏢",
      hint: "Kelola event, venue, kursi, dan tiket.",
    },
    {
      value: "customer",
      label: "Customer",
      icon: "🎫",
      hint: "Cari event, pesan tiket, dan lihat tiket saya.",
    },
  ];

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setUsername(`${nextRole}_demo`);
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }

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
          <div className="brand-mark">TTK</div>
          <div>
            <div className="brand-word">TikTakTuk</div>
            <div className="brand-sub">Concert Ticketing Platform</div>
          </div>
        </div>

        <div className="hero-copy">
          <span className="hero-pill">🟢 Demo frontend TK03</span>
          <h1>Masuk ke pengalaman konser digital.</h1>
          <p>
            Gunakan akun demo untuk menguji dashboard, event, ticket category,
            order, ticket, dan seat sesuai role pengguna.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <b>3</b>
            <span>Demo roles</span>
          </div>
          <div className="meta-card">
            <b>22</b>
            <span>Fitur TK03</span>
          </div>
          <div className="meta-card">
            <b>Dark</b>
            <span>Neon system</span>
          </div>
        </div>
      </div>

      <div className="auth-pane">
        <div className="auth-head">
          <span className="eyebrow">Login</span>
          <h2>Masuk ke Akun Anda</h2>
          <p>Masukkan username dan password, lalu pilih role demo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukkan username"
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
            />
          </label>

          <div className="divider-with-text">Pilih role demo</div>

          <div className="role-picker">
            {roleOptions.map((item) => (
              <button
                className={`role-opt${role === item.value ? " active" : ""}`}
                key={item.value}
                type="button"
                onClick={() => handleRoleChange(item.value)}
              >
                <span className="role-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <p className="helper-text">
            Role aktif: <strong>{role}</strong>. 
          </p>

          {error ? <span className="form-error">{error}</span> : null}

          <Button variant="primary" type="submit">
            Masuk
          </Button>
        </form>

        <p className="linkline">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>.
        </p>
      </div>
    </section>
  );
}

export default LoginPage;