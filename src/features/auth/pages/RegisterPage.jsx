import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import GuestNavbar from "../../../components/layout/GuestNavbar";
import { registerUser } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    organizerName: "",
    contactEmail: "",
    username: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: "customer", label: "Customer", icon: "🎫", hint: "Beli tiket dan kelola pesanan." },
    { value: "organizer", label: "Organizer", icon: "🏢", hint: "Kelola event dan venue." },
    { value: "administrator", label: "Admin", icon: "🛡️", hint: "Kelola seluruh sistem." },
  ];

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const requiredBaseFields = [form.username, form.password, form.confirmPassword];
    const requiredRoleFields = role === "organizer"
      ? [form.organizerName, form.contactEmail]
      : role === "administrator"
      ? []
      : [form.fullName];

    const hasEmptyField = [...requiredBaseFields, ...requiredRoleFields].some(
      (value) => !String(value).trim()
    );

    if (hasEmptyField) { setError("Seluruh field wajib diisi."); return; }
    if (form.password !== form.confirmPassword) { setError("Password dan konfirmasi password tidak sama."); return; }
    if (!form.agree) { setError("Anda harus menyetujui syarat dan ketentuan."); return; }

    setLoading(true);
    try {
      await registerUser({
        username: form.username,
        password: form.password,
        role,
        full_name: form.fullName || null,
        phone_number: form.phone || null,
        organizer_name: form.organizerName || null,
        contact_email: form.contactEmail || null,
      });
      setSuccess("Registrasi berhasil. Silakan login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.message || "Registrasi gagal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <GuestNavbar />
    <section className="auth-screen register-screen auth-screen-wide">
      <div className="hero-pane">
        <div className="brand">
          <div className="brand-mark">TTK</div>
          <div>
            <div className="brand-word">TikTakTuk</div>
            <div className="brand-sub">Built for Concert Ticketing Experiences</div>
          </div>
        </div>

        <div className="hero-copy">
          <span className="hero-pill">✨ Daftar akun baru</span>
          <h1>Buat akun untuk mulai menikmati event.</h1>
          <p>
            Pilih jenis pengguna sesuai kebutuhan dan lengkapi data akun Anda.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <b>Org</b>
            <span>Event manager</span>
          </div>
          <div className="meta-card">
            <b>User</b>
            <span>Ticket buyer</span>
          </div>
        </div>
      </div>

      <div className="auth-pane">
        <div className="auth-head">
          <span className="eyebrow">Register</span>
          <h2>Daftar Akun Baru</h2>
          <p>Pilih role lalu lengkapi data akun.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="role-picker">
            {roleOptions.map((item) => (
              <button
                className={`role-opt${role === item.value ? " active" : ""}`}
                key={item.value}
                type="button"
                onClick={() => setRole(item.value)}
              >
                <span className="role-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {role === "organizer" ? (
            <>
              <label className="form-field">
                <span>Nama Organizer</span>
                <input
                  className="input"
                  type="text"
                  value={form.organizerName}
                  onChange={(event) => updateField("organizerName", event.target.value)}
                  placeholder="Contoh: TikTakTuk Live"
                />
              </label>

              <label className="form-field">
                <span>Email Kontak</span>
                <input
                  className="input"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => updateField("contactEmail", event.target.value)}
                  placeholder="organizer@tiktaktuk.com"
                />
              </label>
            </>
          ) : role === "administrator" ? null : (
            <>
              <label className="form-field">
                <span>Nama Lengkap</span>
                <input
                  className="input"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </label>

              <label className="form-field">
                <span>Nomor Telepon</span>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="Contoh: 081234567890"
                />
              </label>
            </>
          )}

          <label className="form-field">
            <span>Username</span>
            <input
              className="input"
              type="text"
              value={form.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="Masukkan username"
            />
          </label>

          <div className="grid-2">
            <label className="form-field">
              <span>Password</span>
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Masukkan password"
              />
            </label>

            <label className="form-field">
              <span>Konfirmasi Password</span>
              <input
                className="input"
                type="password"
                value={form.confirmPassword}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                placeholder="Ulangi password"
              />
            </label>
          </div>

          <label className="check-wrap">
            <input
              type="checkbox"
              checked={form.agree}
              onChange={(event) => updateField("agree", event.target.checked)}
            />
            <span>
              Saya setuju dengan <strong>Syarat & Ketentuan</strong>.
            </span>
          </label>

          {error ? <span className="form-error">{error}</span> : null}
          {success ? <span className="form-success">{success}</span> : null}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </Button>
        </form>

        <p className="linkline">
          Sudah punya akun? <Link to="/login">Login di sini</Link>.
        </p>
      </div>
    </section>
    </>
  );
}

export default RegisterPage;
