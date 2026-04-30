export default function StatCard({
  label,
  value,
  sub,
  trend,
  icon,
  className = "",
}) {
  return (
    <div
      className={[
        "relative overflow-hidden",
        "rounded-[14px] border border-line-soft",
        "bg-surface-2",
        "p-4",
        "grid gap-2",
        "shadow-soft",
        className,
      ].join(" ")}
    >
      {/* glow effect (matches your CSS ::after) */}
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(199,125,255,0.34),transparent_70%)]" />

      {/* header */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted">
          {label}
        </span>

        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-sm">
            {icon}
          </div>
        )}
      </div>

      {/* main value */}
      <div className="font-display text-2xl leading-tight text-text">
        {value}
      </div>

      {/* bottom row */}
      {(sub || trend) && (
        <div className="flex items-center justify-between text-xs text-muted">
          {sub && <span>{sub}</span>}

          {trend && (
            <span
              className={[
                "font-medium",
                trend.startsWith("+")
                  ? "text-green-300"
                  : trend.startsWith("-")
                  ? "text-red-300"
                  : "text-muted",
              ].join(" ")}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
