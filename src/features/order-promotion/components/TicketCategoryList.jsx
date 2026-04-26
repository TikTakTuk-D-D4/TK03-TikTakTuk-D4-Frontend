import React from "react";
import TicketCategoryItem from "./TicketCategoryItem";

export default function TicketCategoryList({
  categories = [],
  selectedCategoryId = "",
  onSelect,
  title = "Pilih Kategori Tiket",
  emptyMessage = "Belum ada kategori tiket tersedia.",
  className = "",
}) {
  return (
    <section
      className={`rounded-[16px] border border-line-soft bg-surface p-5 text-text shadow-soft ${className}`}
    >
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.5em] text-accent">
          Ticket Category
        </p>

        <h3 className="mt-2 font-display text-lg font-semibold text-text">
          {title}
        </h3>

        <p className="mt-1 text-sm text-muted">
          Pilih kategori tiket yang ingin dibeli.
        </p>
      </div>

      {!categories.length ? (
        <div className="rounded-[14px] border border-dashed border-line-soft bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <TicketCategoryItem
              key={category.id}
              category={category}
              selected={selectedCategoryId === category.id}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
