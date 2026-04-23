import React from "react";
import clsx from "clsx";
import { Badge } from "../../../components/ui/layout/Badge";
import { Button } from "../../../components/ui/layout/Button";
import { formatCurrency } from "../utils/orderUtils";

export default function TicketCategoryItem({
  category,
  selected = false,
  onSelect,
  className = "",
}) {
  if (!category) return null;

  const remainingQuota = Math.max(
    (Number(category.quota) || 0) - (Number(category.sold) || 0),
    0
  );

  const isSoldOut = remainingQuota <= 0;

  const handleSelect = () => {
    if (isSoldOut) return;
    onSelect?.(category);
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border p-4 transition",
        selected
          ? "border-blue-600 bg-blue-50"
          : "border-gray-200 bg-white hover:border-blue-300",
        isSoldOut && "opacity-60",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">
            {category.name}
          </h4>
          <p className="mt-1 text-sm text-gray-600">
            {formatCurrency(category.price)}
          </p>
        </div>

        <Badge variant={isSoldOut ? "danger" : selected ? "primary" : "secondary"}>
          {isSoldOut ? "Habis" : selected ? "Dipilih" : "Tersedia"}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-xs text-gray-500">
          Sisa kuota: <span className="font-medium text-gray-700">{remainingQuota}</span>
        </div>

        <Button
          type="button"
          size="sm"
          variant={selected ? "secondary" : "primary"}
          onClick={handleSelect}
          disabled={isSoldOut}
        >
          {isSoldOut ? "Tidak Tersedia" : selected ? "Terpilih" : "Pilih"}
        </Button>
      </div>
    </div>
  );
}
