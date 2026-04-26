import React from "react";
import SeatButton from "./SeatButton";
import { Divider } from "../../../components/ui/layout/Divider";

import {
  groupSeatsByRow,
  toggleSeatSelection,
  isSeatSelected,
} from "../utils/orderUtils";

export default function SeatPicker({
  seats = [],
  selectedSeatIds = [],
  maxSelection = 1,
  onChange,
  title = "Pilih Kursi",
  className = "",
}) {
  const groupedSeats = groupSeatsByRow(seats);

  const handleSeatClick = (seat) => {
    const updated = toggleSeatSelection(
      selectedSeatIds,
      seat.id,
      maxSelection
    );

    onChange?.(updated);
  };

  const rows = Object.keys(groupedSeats).sort();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <span className="text-xs text-muted">
          Pilih maksimal {maxSelection} kursi
        </span>
      </div>

      <Divider />

      {/* Seat Grid */}
      <div className="space-y-3">
        {rows.map((rowKey) => (
          <div key={rowKey} className="flex items-center gap-3">
            {/* Row Label */}
            <div className="w-6 text-xs font-medium text-muted">
              {rowKey}
            </div>

            {/* Seats */}
            <div className="flex flex-wrap gap-2">
              {groupedSeats[rowKey].map((seat) => (
                <SeatButton
                  key={seat.id}
                  seat={seat}
                  selected={isSeatSelected(selectedSeatIds, seat.id)}
                  disabled={!seat.isAvailable}
                  onClick={handleSeatClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded border border-line bg-surface" />
          Tersedia
        </div>

        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-primary-600" />
          Dipilih
        </div>

        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-gray-300" />
          Tidak tersedia
        </div>
      </div>
    </div>
  );
}
