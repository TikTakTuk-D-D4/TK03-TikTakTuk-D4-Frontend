import React from "react";
import TicketCategoryItem from "./TicketCategoryItem";
import { Divider } from "../../../components/ui/layout/Divider";

export default function TicketCategoryList({
  categories = [],
  selectedCategoryId = "",
  onSelect,
  title = "Pilih Kategori Tiket",
  emptyMessage = "Belum ada kategori tiket tersedia.",
  className = "",
}) {
  if (!categories.length) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <Divider />
      </div>

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
    </div>
  );
}
