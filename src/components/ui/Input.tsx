import React from "react";

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const cn = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join("");

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm text-zinc-300">
          {label}
        </label>
      )}

      <input 
        id={id}
        {...props}
        className={cn(
          "h-11 w-full rounded-[10px] border bg-white/[0.02] px-4 text-sm text-text outline-none transition",
          "placeholder:text-muted/45",
          error 
            ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/20"
            : "border-line-soft focus:border-accent focus:ring-4 focus:ring-accent/20",
          className
        )}
      />
      
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      {!error && helperText && (
        <p className="mt-1.5 text-xs text-zinc-500">{helperText}</p>
      )}
    </div>
  );
};
