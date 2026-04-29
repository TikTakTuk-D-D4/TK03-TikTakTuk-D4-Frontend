import Input from "../../../components/ui/Input";

export default function OrganizerFields({
  values,
  errors = {},
  onChange,
  disabled = false,
}) {
  const handleChange = (event) => {
    const { name, value } = event.target;

    onChange({
      ...values,
      [name]: value,
    });
  };

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-medium text-muted">
        Nama Organizer
        <Input
          name="organizerName"
          value={values.organizerName || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Contoh: TikTakTuk Live"
          className={errors.organizerName ? "border-danger" : ""}
        />
        {errors.organizerName && (
          <span className="text-xs text-danger">{errors.organizerName}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium text-muted">
        Email Kontak
        <Input
          type="email"
          name="contactEmail"
          value={values.contactEmail || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="organizer@email.com"
          className={errors.contactEmail ? "border-danger" : ""}
        />
        {errors.contactEmail && (
          <span className="text-xs text-danger">{errors.contactEmail}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-medium text-muted">
        Username
        <Input
          name="username"
          value={values.username || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Masukkan username"
          className={errors.username ? "border-danger" : ""}
        />
        {errors.username && (
          <span className="text-xs text-danger">{errors.username}</span>
        )}
      </label>
    </div>
  );
}
