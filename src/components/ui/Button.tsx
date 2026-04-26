import React from "react";
import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join("");

const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:from-purple-400 hover:to-fuchsia-300",
    secondary: "bg-[#221b2b] text-zinc-100 border border-white/10 hover:bg-[#2c2238]",
    outline: "border border-purple-400/70 bg-transparent text-purple-200 hover:bg-purple-500/15",
    ghost: "bg-transparent text-zinc-300 hover:bg-white/10",
    danger: "bg-red-500 text-white hover:bg-red-400",
};

const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3 text-xs",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
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
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
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


