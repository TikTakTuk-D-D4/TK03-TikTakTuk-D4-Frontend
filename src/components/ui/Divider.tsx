import React from "react";

type DividerProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-white/10",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
    />
  );
};
