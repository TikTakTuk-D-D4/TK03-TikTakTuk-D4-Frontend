import React from "react";
import TicketCategoryItem from "./TicketCategoryItem";
import { ds } from "./styles";

export default function TicketCategoryList({
  categories = [],
  selectedCategoryId = "",
  onSelect,
  title = "Pilih Kategori Tiket",
  emptyMessage = "Belum ada kategori tiket tersedia.",
  className = "",
}) {
  return (
    <section className={`${ds.card} p-5 ${className}`}>
      <div className="mb-4">
        <h3 className="font-semibold text-text">{title}</h3>
        <p className="mt-1 text-sm text-muted">
          Setiap kategori memiliki fasilitas berbeda.
        </p>
      </div>

      {!categories.length ? (
        <div className="rounded-[14px] border border-dashed border-line-soft p-6 text-center">
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
