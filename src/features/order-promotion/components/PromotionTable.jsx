import React from "react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

import {
  formatPromotionType,
  formatPromotionValue,
  formatPromotionUsage,
  getPromotionStatus,
  getPromotionStatusLabel,
  getPromotionStatusVariant,
} from "../utils/promotionUtils";

export default function PromotionTable({
  promotions = [],
  isAdmin = true,
  onEdit,
  onDelete,
  emptyMessage = "Belum ada data promosi.",
}) {
  const renderStatusBadge = (promotion) => {
    const status = getPromotionStatus(promotion);
    const label = getPromotionStatusLabel(status);
    const variant = getPromotionStatusVariant(status);

    return (
      <Badge
        variant={variant}
        className="w-fit px-2.5 py-1 text-[10px] uppercase tracking-[0.45px]"
      >
        {label}
      </Badge>
    );
  };

  const renderTypeBadge = (discountType) => {
    const variant = discountType === "NOMINAL" ? "warning" : "primary";

    return (
      <Badge
        variant={variant}
        className="w-fit px-2.5 py-1 text-[10px] uppercase tracking-[0.45px]"
      >
        {formatPromotionType(discountType)}
      </Badge>
    );
  };

  if (!promotions.length) {
    return (
      <div className="rounded-[16px] border border-dashed border-line-soft bg-surface p-10 text-center text-muted shadow-soft">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[18px] border border-line-soft bg-surface text-text shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-[11px] uppercase tracking-[0.4px] text-muted">
              <th className="px-4 py-3 font-medium">Kode Promo</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Nilai Diskon</th>
              <th className="px-4 py-3 font-medium">Mulai</th>
              <th className="px-4 py-3 font-medium">Berakhir</th>
              <th className="px-4 py-3 font-medium">Penggunaan</th>
              {isAdmin && <th className="px-4 py-3 text-right font-medium">Action</th>}
            </tr>
          </thead>

          <tbody>
            {promotions.map((promotion) => {
              const usagePercentage = promotion.usageLimit
                ? Math.min(
                    (Number(promotion.usedCount || 0) /
                      Number(promotion.usageLimit || 1)) *
                      100,
                    100
                  )
                : 0;

              return (
                <tr
                  key={promotion.promotionId}
                  className="border-b border-white/5 transition last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-[10px] border border-line bg-primary/10 font-mono text-[10px] text-accent">
                        PR
                      </div>
                      <div className="space-y-2">
                        <p className="font-display text-sm font-semibold text-text">
                          {promotion.promoCode}
                        </p>
                        {renderStatusBadge(promotion)}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">{renderTypeBadge(promotion.discountType)}</td>

                  <td className="px-4 py-4 font-semibold text-text">
                    {formatPromotionValue(
                      promotion.discountType,
                      promotion.discountValue
                    )}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-muted">
                    {promotion.startDate}
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-muted">
                    {promotion.endDate}
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <p className="font-medium text-text">
                        {formatPromotionUsage(
                          promotion.usedCount,
                          promotion.usageLimit
                        )}
                      </p>
                      <div className="h-1.5 w-full rounded-full bg-white/6">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(promotion)}
                          className="text-muted hover:text-text"
                        >
                          Update
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => onDelete?.(promotion)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
