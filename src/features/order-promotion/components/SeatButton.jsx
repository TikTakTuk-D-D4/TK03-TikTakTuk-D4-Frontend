import React from "react";

export default function SeatButton({
  seat,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}) {
  if (!seat) return null;

  const isUnavailable = disabled || seat.isAvailable === false;
  const seatLabel = `${seat.rowNumber}${seat.seatNumber}`;

  const handleClick = () => {
    if (!isUnavailable) onClick?.(seat);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isUnavailable}
      aria-pressed={selected}
      aria-label={`Seat ${seatLabel}`}
      className={[
        "grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border p-0 text-center text-xs font-semibold leading-none transition-all overflow-hidden",
        selected
          ? "border-accent bg-primary text-white shadow-glow"
          : "border-line-soft bg-surface-2 text-muted hover:border-line hover:bg-white/[0.05] hover:text-text",
        isUnavailable
          ? "cursor-not-allowed border-line-soft bg-surface-3 text-muted opacity-40 hover:border-line-soft hover:bg-surface-3 hover:text-muted"
          : "",
        className,
      ].join(" ")}
    >
      <span className="leading-none">{seatLabel}</span>
    </button>
  );
}
