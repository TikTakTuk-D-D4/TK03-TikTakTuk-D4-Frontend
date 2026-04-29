import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import AuthFormCard from "./AuthFormCard";
import CustomerFields from "./CustomerFields";
import OrganizerFields from "./OrganizerFields";
import PasswordField from "./PasswordField";
import RegisterRoleStep from "./RegisterRoleStep";

const INITIAL_FORM = {
  role: "customer",
  fullName: "",
  phoneNumber: "",
  organizerName: "",
  contactEmail: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterForm({ selectedRole = "customer", onRegister }) {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    role: selectedRole,
  });

  const [errors, setErrors] = useState({});

  const role = form.role;

  const handleRoleChange = (nextRole) => {
    setForm((current) => ({
      ...current,
      role: nextRole,
    }));
    setErrors({});
  };

  const validate = () => {
    const nextErrors = {};

    if (role === "customer") {
      if (!form.fullName.trim()) {
        nextErrors.fullName = "Nama lengkap wajib diisi.";
      }

      if (!form.phoneNumber.trim()) {
        nextErrors.phoneNumber = "Nomor telepon wajib diisi.";
      }
    }

    if (role === "organizer") {
      if (!form.organizerName.trim()) {
        nextErrors.organizerName = "Nama organizer wajib diisi.";
      }

      if (!form.contactEmail.trim()) {
        nextErrors.contactEmail = "Email kontak wajib diisi.";
      } else if (!/\S+@\S+\.\S+/.test(form.contactEmail)) {
        nextErrors.contactEmail = "Format email tidak valid.";
      }
    }

    if (!form.username.trim()) {
      nextErrors.username = "Username wajib diisi.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password wajib diisi.";
    } else if (form.password.length < 6) {
      nextErrors.password = "Password minimal 6 karakter.";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    return nextErrors;
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      general: "",
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onRegister?.({
      role: form.role,
      username: form.username,
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      organizerName: form.organizerName,
      contactEmail: form.contactEmail,
    });
  };

  return (
    <AuthFormCard
      title="Daftar Akun"
      description="Pilih role dan lengkapi data pengguna sesuai kebutuhan TikTakTuk."
      footer={
        <>
          Sudah punya akun?{" "}
          <a href="/login" className="text-accent hover:underline">
            Masuk di sini.
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <p className="text-sm font-medium text-muted">Daftar sebagai</p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {["customer", "organizer", "admin"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleRoleChange(item)}
                className={[
                  "rounded-xl border px-3 py-3 text-sm font-medium transition",
                  role === item
                    ? "border-accent bg-primary/20 text-text shadow-glow"
                    : "border-line-soft bg-white/[0.02] text-muted hover:border-line hover:text-text",
                ].join(" ")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {role === "customer" && (
          <CustomerFields values={form} errors={errors} onChange={setForm} />
        )}

        {role === "organizer" && (
          <OrganizerFields values={form} errors={errors} onChange={setForm} />
        )}

        {role === "admin" && (
          <label className="grid gap-2 text-sm font-medium text-muted">
            Username
            <Input
              name="username"
              value={form.username}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  username: event.target.value,
                }))
              }
              placeholder="Masukkan username admin"
              className={errors.username ? "border-danger" : ""}
            />
            {errors.username && (
              <span className="text-xs text-danger">{errors.username}</span>
            )}
          </label>
        )}

        <label className="grid gap-2 text-sm font-medium text-muted">
          Password
          <PasswordField
            name="password"
            value={form.password}
            onChange={handlePasswordChange}
            placeholder="Minimal 6 karakter"
            className={errors.password ? "border-danger" : ""}
          />
          {errors.password && (
            <span className="text-xs text-danger">{errors.password}</span>
          )}
        </label>

        <label className="grid gap-2 text-sm font-medium text-muted">
          Konfirmasi Password
          <PasswordField
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Ulangi password"
            className={errors.confirmPassword ? "border-danger" : ""}
          />
          {errors.confirmPassword && (
            <span className="text-xs text-danger">
              {errors.confirmPassword}
            </span>
          )}
        </label>

        <Button type="submit" className="mt-2 w-full">
          Daftar sebagai {role}
        </Button>
      </form>
    </AuthFormCard>
  );
}
