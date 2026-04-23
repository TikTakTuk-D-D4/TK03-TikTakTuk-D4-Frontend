import React from "react";
import clsx from "clsx";

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

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
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input 
        id={id}
        className={clsx(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition",
          error 
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-blue-500".
          "placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        {...props}
      />
      
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}

    </div>
  );
};
