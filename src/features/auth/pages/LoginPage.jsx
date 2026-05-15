import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../context/AuthContext";
import GuestNavbar from "../../../components/layout/GuestNavbar";

const DEMO_ACCOUNTS = {
  admin: { username: "admin_raka", password: "hashed_admin_raka" },
  organizer: { username: "org_bagas", password: "hashed_org_bagas" },
  customer: { username: "cust_andini", password: "hashed_cust_andini" },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("customer");
  const [username, setUsername] = useState(DEMO_ACCOUNTS.customer.username);
  const [password, setPassword] = useState(DEMO_ACCOUNTS.customer.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "admin", label: "Admin", icon: "🛡️", hint: "Kelola sistem, tiket, promo, dan data utama." },
    { value: "organizer", label: "Organizer", icon: "🏢", hint: "Kelola event, venue, kursi, dan tiket." },
    { value: "customer", label: "Customer", icon: "🎫", hint: "Cari event, pesan tiket, dan lihat tiket saya." },
  ];

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setUsername(DEMO_ACCOUNTS[nextRole]?.username || "");
    setPassword(DEMO_ACCOUNTS[nextRole]?.password || "");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Username dan password wajib diisi.");
      return;
    }
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Username atau password salah.");
    } finally {
      setLoading(false);
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
          <p>Masukkan username dan password, lalu pilih role demo.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Username</span>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Memuat..." : "Masuk"}
          </Button>
        </form>

      </div>
    </section>
    </>
  );
}

export default LoginPage;
