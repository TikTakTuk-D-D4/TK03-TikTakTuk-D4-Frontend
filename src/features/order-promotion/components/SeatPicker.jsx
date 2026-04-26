import React from "react";
import SeatButton from "./SeatButton";
import { Divider } from "../../../components/ui/Divider";

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
  const rows = Object.keys(groupedSeats).sort();

  const handleSeatClick = (seat) => {
    const updated = toggleSeatSelection(
      selectedSeatIds,
      seat.id,
      maxSelection
    );

    onChange?.(updated);
  };

  return (
    <div className={`space-y-4 text-text ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-accent">
            Seat Map
          </p>

          <h3 className="mt-2 font-display text-lg font-semibold text-text">
            {title}
          </h3>

          <p className="mt-1 text-sm text-muted">
            Pilih maksimal {maxSelection} kursi sesuai jumlah tiket.
          </p>
        </div>

        <span className="rounded-full border border-line bg-primary/15 px-3 py-1 text-xs text-accent">
          {selectedSeatIds.length}/{maxSelection}
        </span>
      </div>

      <Divider />

      {!rows.length ? (
        <div className="rounded-[14px] border border-dashed border-line-soft bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-muted">Belum ada data kursi.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-[14px] border border-line-soft bg-surface-2 p-4">
          {rows.map((rowKey) => (
            <div key={rowKey} className="flex items-center gap-3">
              <div className="w-6 font-mono text-xs text-accent">
                {rowKey}
              </div>

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
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-line-soft bg-surface-2" />
          Tersedia
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-primary shadow-glow" />
          Dipilih
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-surface-3 opacity-50" />
          Tidak tersedia
        </div>
      </div>
    </div>
  );
}
