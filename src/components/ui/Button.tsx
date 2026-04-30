import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "border border-transparent bg-gradient-to-br from-primary to-accent text-white shadow-glow hover:brightness-110",
    secondary:
      "border border-line-soft bg-surface-2 text-text hover:bg-surface-3",
    outline:
      "border border-line bg-primary/10 text-accent hover:bg-primary/15",
    ghost:
      "border border-line-soft bg-white/[0.03] text-text hover:border-line hover:bg-white/[0.07]",
    danger:
      "border border-danger/45 bg-danger/15 text-danger hover:bg-danger/25",
    success:
      "border border-ok/35 bg-ok/15 text-ok hover:bg-ok/20",
};

const sizes: Record<ButtonSize, string> = {
    sm: "h-9 rounded-[9px] px-3 text-xs",
    md: "h-11 rounded-[11px] px-4 text-sm",
    lg: "h-12 rounded-[13px] px-5 text-sm",
};

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    className,
    disabled,
    ...props 
}) => {
    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-200 active:translate-y-px",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
      >
        {loading ? "Loading..." : children}
      </button>
    );
};
