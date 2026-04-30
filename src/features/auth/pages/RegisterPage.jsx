import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
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

  const roleOptions = [
    {
      value: "customer",
      label: "Customer",
      icon: "🎫",
      hint: "Beli tiket dan kelola pesanan.",
    },
    {
      value: "organizer",
      label: "Organizer",
      icon: "🏢",
      hint: "Kelola event dan venue.",
    },
    {
      value: "admin",
      label: "Admin",
      icon: "🛡️",
      hint: "Kelola data platform.",
    },
  ];

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredBaseFields = [
      form.email,
      form.username,
      form.password,
      form.confirmPassword,
    ];

    const requiredRoleFields =
      role === "organizer"
        ? [form.organizerName, form.contactEmail]
        : [form.fullName];

    const hasEmptyField = [...requiredBaseFields, ...requiredRoleFields].some(
      (value) => !String(value).trim()
    );

    if (hasEmptyField) {
      setError("Seluruh field wajib diisi.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    if (!form.agree) {
      setError("Anda harus menyetujui syarat dan ketentuan.");
      return;
    }

    setSuccess("Registrasi demo berhasil. Silakan login.");
    setTimeout(() => navigate("/login"), 700);
  };

  return (
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
          <span className="hero-pill">✨ Register demo</span>
          <h1>Buat akun untuk mulai menikmati event.</h1>
          <p>
            Pilih jenis pengguna sesuai kebutuhan. Halaman ini hanya
            menampilkan UI frontend dan validasi ringan tanpa koneksi backend.
          </p>
        </div>

        <div className="hero-meta">
          <div className="meta-card">
            <b>Admin</b>
            <span>Platform control</span>
          </div>
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
          <p>Pilih role lalu lengkapi data akun demo.</p>
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
                  onChange={(event) =>
                    updateField("organizerName", event.target.value)
                  }
                  placeholder="Contoh: TikTakTuk Live"
                />
              </label>

              <label className="form-field">
                <span>Email Kontak</span>
                <input
                  className="input"
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) =>
                    updateField("contactEmail", event.target.value)
                  }
                  placeholder="organizer@tiktaktuk.com"
                />
              </label>
            </>
          ) : (
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
          )}

          {role === "customer" ? (
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
          ) : null}

          <label className="form-field">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="Masukkan email"
            />
          </label>

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
                onChange={(event) =>
                  updateField("confirmPassword", event.target.value)
                }
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

          <Button variant="primary" type="submit">
            Daftar
          </Button>
        </form>

        <p className="linkline">
          Sudah punya akun? <Link to="/login">Login di sini</Link>.
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;