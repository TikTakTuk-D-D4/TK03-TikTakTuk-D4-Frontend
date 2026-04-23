import React from "react";
import clsx from "clsx";

type CardProps = {
    children: React.ReactNode;
    className?: string;
} & React.HTMLAttribtes<HTMLDivElement>;

export const Card: React.FC<CardProps> = ({
    children,
    className,
    ...props 
}) => {
  return (
    <div className={clsx(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        className 
      )}
      {...props}
    >
      {children}  
    </div>
  );
};

type CardHeaderProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={clsx("mb-4", classname)} {...props}>
      {children}
    </div>
  );
};

type CardTitleProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle: React.FC<CardTitleProps> = {
  children,
  className,
  ...props 
}) => {
  return (
    <h3 className={clsx("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
};

type CardContentProps = {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>;

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props 
}) => {
    return (
      <div className={clsx("", className)} {...props}>
        {children}
      </div>
    );
};
