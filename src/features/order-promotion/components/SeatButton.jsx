import React from "react";
import clsx from "clsx";

export default function SeatButton({
  seat,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}) {
  if (!seat) return null;

  const isUnavailable = disabled || seat.isAvailable === false;

  const handleClick = () => {
    if (isUnavailable) return;
    onClick?.(seat);
  };

  const seatLabel = `${seat.rowNumber}${seat.seatNumber}`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUnavailable}
      aria-pressed={selected}
      aria-label={`Seat ${seatLabel}`}
      className={clsx(
        "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition",
        selected && "border-blue-600 bg-primary-600 text-white",
        !selected &&
          !isUnavailable &&
          "border-line bg-surface text-gray-800 hover:border-accent hover:text-accent",
        isUnavailable &&
          "cursor-not-allowed border-line-soft bg-surface-2 text-gray-400",
        className
      )}
    >
      {seatLabel}
    </button>
  );
}
