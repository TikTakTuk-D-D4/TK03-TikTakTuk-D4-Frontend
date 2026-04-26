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
        className={cn(
          "h-11 w-full rounded-xl border bg-[#] px-4 text-sm text-white outline-none transition",
          "placeholder:text-zinc-500",
          error 
            ? "border-red-400 focus:border-red-400"
            : "border-white/10 focus:border-purple-400",
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

