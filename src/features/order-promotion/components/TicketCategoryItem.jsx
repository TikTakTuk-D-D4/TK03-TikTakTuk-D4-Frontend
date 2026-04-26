import React from "react";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
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
    if (!isSoldOut) onSelect?.(category);
  };

  const handleCardKeyDown = (event) => {
    if (isSoldOut) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={isSoldOut ? -1 : 0}
      aria-pressed={selected}
      onClick={handleSelect}
      onKeyDown={handleCardKeyDown}
      className={[
        "rounded-[14px] border p-4 transition-all",
        selected
          ? "border-accent bg-primary/20 text-text shadow-glow"
          : "border-line-soft bg-surface-2 text-text hover:border-line hover:bg-white/[0.04]",
        isSoldOut ? "cursor-not-allowed opacity-40" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-display text-sm font-semibold text-text">
            {category.name}
          </h4>

          <p className="mt-1 text-xs text-muted">
            Sisa kuota:{" "}
            <span className="font-medium text-text">{remainingQuota}</span>
          </p>
        </div>

        <p className="font-semibold text-accent">
          {formatCurrency(category.price)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <Badge
          variant={isSoldOut ? "danger" : selected ? "primary" : "secondary"}
        >
          {isSoldOut ? "Habis" : selected ? "Dipilih" : "Tersedia"}
        </Badge>

        <Button
          type="button"
          size="sm"
          variant={selected ? "ghost" : "primary"}
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          disabled={isSoldOut}
        >
          {isSoldOut ? "Penuh" : selected ? "Terpilih" : "Pilih"}
        </Button>
      </div>
    </div>
  );  
}
