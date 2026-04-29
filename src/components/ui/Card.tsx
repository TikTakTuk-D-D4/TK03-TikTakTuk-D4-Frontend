import React from "react";

type BaseProps<T> = {
  children: React.ReactNode;
  className?: string;
} & T;

const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

export const Card: React.FC<BaseProps<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "rounded-3xl border border-white/10 bg-[#181818]/95 text-zinc-100 shadow-2xl",
        "backdrop-blur-xl",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<BaseProps<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={cn("p-6 pb-3", className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<BaseProps<React.HTMLAttributes<HTMLHeadingElement>>> = ({
  children,
  className,
  ...props
}) => (
  <h3 {...props} className={cn("text-xl font-bold text-white", className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<BaseProps<React.HTMLAttributes<HTMLDivElement>>> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={cn("p-6 pt-3", className)}>
    {children}
  </div>
);
