import React from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const variants: Record<BadgeVariant, string> = {
  primary: "border-purple-400/40 bg-purple-500/15 text-purple-200",
  secondary: "border-white/10 bg-white/5 text-zinc-300",
  success: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  warning: "border-yellow-400/40 bg-yellow-500/15 text-yellow-300",
  danger: "border-red-400/40 bg-red-500/15 text-red-300",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
