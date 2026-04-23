import React from "react";
import clsx from "clsx";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className,
  ...props
}) => {
  return (
    <div 
      role="separator"
      aria-orientation={orientation}
      className={clsx(
        "bg-gray-200",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  );
};
