import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";

export default function DeletePromotionModal({
  isOpen,
  promotion,
  onClose,
  onConfirm,
  isLoading = false,
}) {
  if (!isOpen || !promotion) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  const handleConfirm = () => {
    onConfirm?.(promotion);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md rounded-2xl bg-surface shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-text">
            Hapus Promosi
          </CardTitle>
        </CardHeader>

        <Divider />

        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-gray-600">
            Apakah kamu yakin ingin menghapus promosi ini?
          </p>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Promotion ID
              </p>
              <p className="text-sm font-semibold text-text">
                {promotion.promotionId || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                Kode Promo
              </p>
              <p className="text-sm font-semibold text-text">
                {promotion.promoCode || "-"}
              </p>
            </div>
          </div>

          <p className="text-sm text-red-500">
            Tindakan ini tidak dapat dibatalkan.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
