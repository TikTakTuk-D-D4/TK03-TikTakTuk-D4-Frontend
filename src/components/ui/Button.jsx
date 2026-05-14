import { clsx } from "clsx";

export function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  type = "button",
  ...props
}) {
  const base =
    "inline-flex items-center gap-2 rounded-[10px] font-sans font-semibold transition-all duration-150 whitespace-nowrap border disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary text-bg border-transparent shadow-btn-primary hover:bg-primary-hover hover:-translate-y-px",
    ghost: "bg-card text-ink border-edge hover:border-primary hover:text-primary-hover",
    danger: "bg-danger-soft text-danger border-danger/25 hover:bg-danger hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-[18px] py-2.5 text-sm",
  };

  return (
    <button
      type={type}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
