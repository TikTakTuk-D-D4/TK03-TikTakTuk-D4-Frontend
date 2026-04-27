import { clsx } from "clsx";

export function IconButton({ icon, danger = false, className, ...props }) {
  return (
    <button
      type="button"
      className={clsx(
        "h-8 w-8 grid place-items-center rounded-md border border-edge bg-card text-ink-dim transition-all",
        danger
          ? "hover:border-danger/40 hover:text-danger hover:bg-danger-soft"
          : "hover:border-edge-glow hover:text-primary-hover",
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
