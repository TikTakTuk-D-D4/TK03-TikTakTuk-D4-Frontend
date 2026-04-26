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
    <div
      className={`rounded-[16px] border border-line-soft bg-surface p-5 text-text shadow-soft ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-text">{label}</h3>
          <p className="mt-1 text-xs text-muted">
            Maks {max} tiket per transaksi
          </p>
        </div>

        <span className="rounded-full border border-line bg-primary/15 px-3 py-1 text-xs text-accent">
          {min}–{max}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={isMinReached}
          className="h-10 w-10 rounded-[10px] border border-line-soft bg-surface/[0.03] p-0 text-lg text-text hover:border-line hover:bg-surface/[0.07]"
        >
          −
        </Button>

        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={[
            "h-10 w-20 rounded-[10px] border bg-surface/[0.02] px-3 text-center text-sm font-semibold text-text outline-none transition",
            "placeholder:text-muted/45",
            error
              ? "border-danger focus:border-danger focus:ring-4 focus:ring-danger/20"
              : "border-line-soft focus:border-accent focus:ring-4 focus:ring-accent/20",
          ].join(" ")}
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={isMaxReached}
          className="h-10 w-10 rounded-[10px] border border-line-soft bg-surface/[0.03] p-0 text-lg text-text hover:border-line hover:bg-surface/[0.07]"
        >
          +
        </Button>
      </div>

      {helperText && !error && (
        <p className="mt-3 text-xs text-muted">{helperText}</p>
      )}

      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
    </div>
  );
}
