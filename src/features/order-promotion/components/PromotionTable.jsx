import React from "react";
import { Button } from "../../../components/ui/layout/Button";
import { Badge } from "../../../components/ui/layout/Badge";
import { Divider } from "../../../components/ui/layout/Divider";

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

    return <Badge variant={variant}>{label}</Badge>;
  };

  if (!promotions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
        <p className="text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-4 py-3 font-medium">Kode Promo</th>
              <th className="px-4 py-3 font-medium">Tipe Diskon</th>
              <th className="px-4 py-3 font-medium">Nilai Diskon</th>
              <th className="px-4 py-3 font-medium">Tanggal Mulai</th>
              <th className="px-4 py-3 font-medium">Tanggal Berakhir</th>
              <th className="px-4 py-3 font-medium">Penggunaan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {isAdmin && <th className="px-4 py-3 font-medium">Action</th>}
            </tr>
          </thead>

          <tbody>
            {promotions.map((promotion, index) => (
              <React.Fragment key={promotion.promotionId}>
                <tr className="text-sm text-gray-700">
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {promotion.promoCode}
                  </td>

                  <td className="px-4 py-4">
                    {formatPromotionType(promotion.discountType)}
                  </td>

                  <td className="px-4 py-4">
                    {formatPromotionValue(
                      promotion.discountType,
                      promotion.discountValue
                    )}
                  </td>

                  <td className="px-4 py-4">{promotion.startDate}</td>

                  <td className="px-4 py-4">{promotion.endDate}</td>

                  <td className="px-4 py-4">
                    {formatPromotionUsage(
                      promotion.usedCount,
                      promotion.usageLimit
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {renderStatusBadge(promotion)}
                  </td>

                  {isAdmin && (
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit?.(promotion)}
                        >
                          Update
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete?.(promotion)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>

                {index !== promotions.length - 1 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-0 py-0">
                      <Divider />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
