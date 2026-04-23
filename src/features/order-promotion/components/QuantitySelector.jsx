import React from "react";
import { Button } from "../../../components/ui/layout/Button";

import {
  incrementQuantity,
  decrementQuantity,
} from "../utils/orderUtils";

export default function QuantitySelector({
  value = 1,
  min = 1,
  max = 10,
  onChange,
  label = "Jumlah Tiket",
  helperText,
  error,
  className = "",
}) {
  const safeValue = Number(value) || min;

  const handleDecrease = () => {
    const nextValue = decrementQuantity(safeValue, min);
    onChange?.(nextValue);
  };

  const handleIncrease = () => {
    const nextValue = incrementQuantity(safeValue, max);
    onChange?.(nextValue);
  };

  const handleInputChange = (event) => {
    const rawValue = event.target.value;

    if (rawValue === "") {
      onChange?.("");
      return;
    }

    const numericValue = Number(rawValue);

    if (Number.isNaN(numericValue)) return;

    onChange?.(numericValue);
  };

  const handleBlur = () => {
    let normalizedValue = Number(value);

    if (!Number.isInteger(normalizedValue) || normalizedValue < min) {
      normalizedValue = min;
    }

    if (normalizedValue > max) {
      normalizedValue = max;
    }

    onChange?.(normalizedValue);
  };

  const isMinReached = safeValue <= min;
  const isMaxReached = safeValue >= max;

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">
          Min {min} • Maks {max}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDecrease}
          disabled={isMinReached}
          className="h-10 w-10 rounded-xl p-0"
        >
          -
        </Button>

        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`h-10 w-20 rounded-xl border px-3 text-center text-sm outline-none transition ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIncrease}
          disabled={isMaxReached}
          className="h-10 w-10 rounded-xl p-0"
        >
          +
        </Button>
      </div>

      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
