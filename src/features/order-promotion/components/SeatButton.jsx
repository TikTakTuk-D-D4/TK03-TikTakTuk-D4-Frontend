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
        selected && "border-blue-600 bg-blue-600 text-white",
        !selected &&
          !isUnavailable &&
          "border-gray-300 bg-white text-gray-800 hover:border-blue-500 hover:text-blue-600",
        isUnavailable &&
          "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400",
        className
      )}
    >
      {seatLabel}
    </button>
  );
}
