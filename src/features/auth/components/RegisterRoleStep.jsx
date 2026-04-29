const ROLES = [
  {
    value: "customer",
    label: "Customer",
    description: "Beli tiket dan kelola pesanan.",
    icon: "🎫",
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Kelola event, venue, dan tiket.",
    icon: "🎤",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Kelola data utama TikTakTuk.",
    icon: "⚡",
  },
];

export default function RegisterRoleStep({
  value = "customer",
  onChange,
  disabled = false,
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-muted">Daftar sebagai</p>
        <p className="text-xs text-muted">
          Pilih role akun yang ingin dibuat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ROLES.map((role) => {
          const isActive = value === role.value;

          return (
            <button
              key={role.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(role.value)}
              className={[
                "rounded-xl border p-3 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-50",
                isActive
                  ? "border-accent bg-primary/20 text-text shadow-glow"
                  : "border-line-soft bg-white/[0.02] text-muted hover:border-line hover:text-text",
              ].join(" ")}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] font-display text-lg">
                {role.icon}
              </div>

              <div className="font-medium">{role.label}</div>

              <p className="mt-1 text-xs leading-relaxed text-muted">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
