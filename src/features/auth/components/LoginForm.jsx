import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import AuthFormCard from "./AuthFormCard";
import PasswordField from "./PasswordField";
import { DEMO_USERS } from "../mocks/authMock";

export default function LoginForm({ selectedRole = "admin", onLogin }) {
  const demoUser = DEMO_USERS[selectedRole] ?? DEMO_USERS.admin;

  const [form, setForm] = useState({
    username: demoUser.username,
    password: demoUser.password,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
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

  const validate = () => {
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = "Username wajib diisi.";
    }

    if (!form.password.trim()) {
      nextErrors.password = "Password wajib diisi.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (
      form.username !== demoUser.username ||
      form.password !== demoUser.password
    ) {
      setErrors({
        general: `Username atau password untuk role ${demoUser.label} tidak sesuai.`,
      });
      return;
    }

    onLogin?.({
      role: selectedRole,
      username: form.username,
    });
  };

  return (
    <AuthFormCard
      title="Login Demo"
      description="Masuk cepat untuk memeriksa flow frontend sesuai role."
      footer={
        <>
          Belum perlu registrasi untuk TK03.{" "}
          <a href="/register" className="text-accent hover:underline">
            Lihat halaman register.
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        {errors.general && (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {errors.general}
          </div>
        )}

        <label className="grid gap-2 text-sm font-medium text-muted">
          Username
          <Input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Masukkan username"
            className={errors.username ? "border-danger" : ""}
          />
          {errors.username && (
            <span className="text-xs text-danger">{errors.username}</span>
          )}
        </label>

        <label className="grid gap-2 text-sm font-medium text-muted">
          Password
          <PasswordField
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Masukkan password"
            className={errors.password ? "border-danger" : ""}
          />
          {errors.password && (
            <span className="text-xs text-danger">{errors.password}</span>
          )}
        </label>

        <Button type="submit" className="mt-2 w-full">
          Masuk sebagai {demoUser.label}
        </Button>
      </form>
    </AuthFormCard>
  );
}
