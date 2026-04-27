import { clsx } from "clsx";

export function Select({ error, children, className, ...props }) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full px-3.5 py-2.5 bg-bg-soft border rounded-[10px] text-ink text-sm transition-all",
        "focus:outline-none focus:ring-[3px] focus:ring-primary-soft",
        error ? "border-danger focus:border-danger" : "border-edge focus:border-primary",
        className
      )}
    >
      {children}
    </select>
  );
}
