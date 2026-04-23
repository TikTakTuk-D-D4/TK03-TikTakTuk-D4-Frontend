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
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="text-xs text-gray-500">
          Pilih maksimal {maxSelection} kursi
        </span>
      </div>

      <Divider />

      {/* Seat Grid */}
      <div className="space-y-3">
        {rows.map((rowKey) => (
          <div key={rowKey} className="flex items-center gap-3">
            {/* Row Label */}
            <div className="w-6 text-xs font-medium text-gray-500">
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
      <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded border border-gray-300 bg-white" />
          Tersedia
        </div>

        <div className="flex items-center gap-1">
          <div className="h-4 w-4 rounded bg-blue-600" />
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
