import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";

const ROLE_LABELS = {
  admin: "Administrator",
  organizer: "Organizer",
  customer: "Customer",
};

export default function ProfileCard({
  user,
  onEdit,
  onUpdatePassword,
  className = "",
}) {
  if (!user) return null;

  const role = user.role || "customer";
  const roleLabel = ROLE_LABELS[role] ?? role;

  const initials = getInitials(
    user.fullName || user.organizerName || user.username || "User"
  );

  return (
    <Card
      className={[
        "relative overflow-hidden rounded-[16px]",
        "border border-line-soft bg-surface p-5 shadow-soft",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(199,125,255,0.28),transparent_70%)]" />

      <div className="relative grid gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-lg font-semibold text-white shadow-glow">
              {initials}
            </div>

            <div className="grid gap-1">
              <h3 className="font-display text-lg font-semibold text-text">
                {getDisplayName(user)}
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-line bg-primary/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-accent">
                  {roleLabel}
                </span>

                <span className="font-mono text-xs text-muted">
                  @{user.username}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-[14px] border border-line-soft bg-white/[0.02] p-4">
          <ProfileRow label="Username" value={user.username} />

          {role === "customer" && (
            <>
              <ProfileRow label="Nama Lengkap" value={user.fullName} />
              <ProfileRow label="Nomor Telepon" value={user.phoneNumber} />
            </>
          )}

          {role === "organizer" && (
            <>
              <ProfileRow label="Nama Organizer" value={user.organizerName} />
              <ProfileRow label="Email Kontak" value={user.contactEmail} />
            </>
          )}

          {role === "admin" && (
            <ProfileRow
              label="Hak Akses"
              value="Mengelola data utama dan operasional platform"
            />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onUpdatePassword && (
            <Button
              type="button"
              variant="ghost"
              onClick={onUpdatePassword}
              className="w-full sm:w-auto"
            >
              Update Password
            </Button>
          )}

          {onEdit && (
            <Button
              type="button"
              onClick={onEdit}
              className="w-full sm:w-auto"
            >
              Edit Profil
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[160px_1fr] sm:gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </span>
      <span className="text-sm text-text">{value || "-"}</span>
    </div>
  );
}

function getDisplayName(user) {
  if (user.role === "customer") return user.fullName || user.username;
  if (user.role === "organizer") return user.organizerName || user.username;
  return user.username;
}

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
