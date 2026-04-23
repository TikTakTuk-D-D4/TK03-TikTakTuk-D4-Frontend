import React from "react";
import clsx from "clsx";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "danger";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-blue-100 text-blue-700",
  secondary: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  danger: "bg-red-100 text-red-700",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
