import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { getDemoUsers, loginWithCredentials } from "../services/authService";
import GuestNavbar from "../../../components/layout/GuestNavbar";

function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("admin@tiktaktuk.id");
  const [password, setPassword] = useState("demo123");
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
    const demoUsers = getDemoUsers();
    const nextEmail = demoUsers?.[nextRole]?.email || "";
    setRole(nextRole);
    setEmail(nextEmail);
    setPassword("demo123");
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      loginWithCredentials({ email, password });
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Email atau password salah.");
    }
  };

  return (
    <>
    <GuestNavbar />
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
          <p>Masukkan email dan password, lalu pilih role demo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Masukkan email"
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

      </div>
    </section>
    </>
  );
}

export default LoginPage;