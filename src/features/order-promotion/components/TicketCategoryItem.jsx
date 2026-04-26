import React from "react";
import { Badge } from "../../../components/ui/layout/Badge";
import { Button } from "../../../components/ui/layout/Button";
import { formatCurrency } from "../utils/orderUtils";
import { ds } from "./styles";

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
    if (!isSoldOut) onSelect?.(category);
  };

  return (
    <div
      className={[
        "rounded-[14px] border p-4 transition-all",
        selected ? ds.selected : "border-line-soft bg-surface-2 hover:border-line",
        isSoldOut ? "opacity-40" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-text">{category.name}</h4>
          <p className="mt-1 text-xs text-muted">
            Kuota: {remainingQuota} tiket
          </p>
        </div>

        <p className="font-semibold text-accent">
          {formatCurrency(category.price)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge variant={isSoldOut ? "danger" : selected ? "primary" : "secondary"}>
          {isSoldOut ? "Habis" : selected ? "Dipilih" : "Tersedia"}
        </Badge>

        <Button
          type="button"
          size="sm"
          variant={selected ? "outline" : "primary"}
          onClick={handleSelect}
          disabled={isSoldOut}
        >
          {selected ? "Terpilih" : "Pilih"}
        </Button>
      </div>
    </div>
  );
}
