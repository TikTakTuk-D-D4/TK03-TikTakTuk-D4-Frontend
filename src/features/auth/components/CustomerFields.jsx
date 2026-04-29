import Input from "../../../components/ui/Input";

export default function CustomerFields({
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
        Nama Lengkap
        <Input
          name="fullName"
          value={values.fullName || ""}
          onChange={handleChange}
          disabled={disabled}
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
          value={values.phoneNumber || ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Masukkan nomor telepon"
          className={errors.phoneNumber ? "border-danger" : ""}
        />
        {errors.phoneNumber && (
          <span className="text-xs text-danger">{errors.phoneNumber}</span>
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
