import { useState } from "react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

const ROLE_LABELS = {
  customer: "Customer",
  organizer: "Organizer",
  admin: "Administrator",
};

export default function ProfileEditForm({
  user,
  onSubmit,
  onCancel,
  loading = false,
  className = "",
}) {
  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    organizerName: user?.organizerName || "",
    contactEmail: user?.contactEmail || "",
  }));

  const [errors, setErrors] = useState({});

  if (!user) return null;

  const role = user.role || "customer";
  const roleLabel = ROLE_LABELS[role] ?? role;

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
      const payload =
        role === "customer"
          ? {
              fullName: form.fullName,
              phoneNumber: form.phoneNumber,
            }
          : role === "organizer"
          ? {
              organizerName: form.organizerName,
              contactEmail: form.contactEmail,
            }
          : {};

      await onSubmit?.({
        ...user,
        ...payload,
      });
    } catch (error) {
      setErrors({
        general:
          error?.message || "Gagal memperbarui profil. Silakan coba lagi.",
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
          Edit Profil
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          Update informasi profil untuk role{" "}
          <span className="text-accent">{roleLabel}</span>.
        </p>
      </div>

      {errors.general && (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {errors.general}
        </div>
      )}

      <label className="grid gap-2 text-sm font-medium text-muted">
        Username
        <Input value={user.username || ""} disabled />
        <span className="text-xs text-muted">
          Username tidak dapat diubah.
        </span>
      </label>

      {role === "customer" && (
        <>
          <label className="grid gap-2 text-sm font-medium text-muted">
            Nama Lengkap
            <Input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              disabled={loading}
              placeholder="Masukkan nama lengkap"
              className={errors.fullName ? "border-danger" : ""}
            />
            {errors.fullName && (
              <span className="text-xs text-danger">{errors.fullName}</span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-muted">
            Nomor Telepon
            <Input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={loading}
              placeholder="Masukkan nomor telepon"
              className={errors.phoneNumber ? "border-danger" : ""}
            />
            {errors.phoneNumber && (
              <span className="text-xs text-danger">
                {errors.phoneNumber}
              </span>
            )}
          </label>
        </>
      )}

      {role === "organizer" && (
        <>
          <label className="grid gap-2 text-sm font-medium text-muted">
            Nama Organizer
            <Input
              name="organizerName"
              value={form.organizerName}
              onChange={handleChange}
              disabled={loading}
              placeholder="Masukkan nama organizer"
              className={errors.organizerName ? "border-danger" : ""}
            />
            {errors.organizerName && (
              <span className="text-xs text-danger">
                {errors.organizerName}
              </span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-medium text-muted">
            Email Kontak
            <Input
              type="email"
              name="contactEmail"
              value={form.contactEmail}
              onChange={handleChange}
              disabled={loading}
              placeholder="organizer@email.com"
              className={errors.contactEmail ? "border-danger" : ""}
            />
            {errors.contactEmail && (
              <span className="text-xs text-danger">
                {errors.contactEmail}
              </span>
            )}
          </label>
        </>
      )}

      {role === "admin" && (
        <div className="rounded-xl border border-line-soft bg-white/[0.02] px-4 py-3 text-sm text-muted">
          Admin tidak memiliki field profil tambahan untuk diubah pada TK03.
        </div>
      )}

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

        <Button
          type="submit"
          disabled={loading || role === "admin"}
          className="w-full sm:w-auto"
        >
          {loading ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </div>
    </form>
  );
}
