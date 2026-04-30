import { useState } from "react";
import Button from "../../../components/ui/Button";
import PasswordField from "../../auth/components/PasswordField";

const INITIAL_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export default function PasswordUpdateForm({
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

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

    setSuccessMessage("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.currentPassword.trim()) {
      nextErrors.currentPassword = "Password lama wajib diisi.";
    }

    if (!form.newPassword.trim()) {
      nextErrors.newPassword = "Password baru wajib diisi.";
    } else if (form.newPassword.length < 6) {
      nextErrors.newPassword = "Password baru minimal 6 karakter.";
    }

    if (!form.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (form.confirmPassword !== form.newPassword) {
      nextErrors.confirmPassword = "Konfirmasi password tidak sama.";
    }

    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      nextErrors.newPassword = "Password baru tidak boleh sama dengan password lama.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit?.({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setForm(INITIAL_FORM);
      setErrors({});
      setSuccessMessage("Password berhasil diperbarui.");
    } catch (error) {
      setErrors({
        general:
          error?.message ||
          "Gagal memperbarui password. Silakan coba lagi.",
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={[
        "grid gap-4 rounded-[16px]",
        "border border-line-soft bg-surface p-5 shadow-soft",
        className,
      ].join(" ")}
    >
      <div className="grid gap-1">
        <h3 className="font-display text-lg font-semibold text-text">
          Update Password
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          Masukkan password lama dan password baru untuk memperbarui akun.
        </p>
      </div>

      {errors.general && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errors.general}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-ok/40 bg-ok/10 px-4 py-3 text-sm text-ok">
          {successMessage}
        </div>
      )}

      <label className="grid gap-2 text-sm font-medium text-muted">
        Password Lama
        <PasswordField
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          placeholder="Masukkan password lama"
          disabled={loading}
          className={errors.currentPassword ? "border-danger" : ""}
        />
        {errors.currentPassword && (
          <span className="text-xs text-danger">{errors.currentPassword}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium text-muted">
        Password Baru
        <PasswordField
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          placeholder="Minimal 6 karakter"
          disabled={loading}
          className={errors.newPassword ? "border-danger" : ""}
        />
        {errors.newPassword && (
          <span className="text-xs text-danger">{errors.newPassword}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium text-muted">
        Konfirmasi Password Baru
        <PasswordField
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Ulangi password baru"
          disabled={loading}
          className={errors.confirmPassword ? "border-danger" : ""}
        />
        {errors.confirmPassword && (
          <span className="text-xs text-danger">{errors.confirmPassword}</span>
        )}
      </label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
        )}

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Menyimpan..." : "Simpan Password"}
        </Button>
      </div>
    </form>
  );
}
