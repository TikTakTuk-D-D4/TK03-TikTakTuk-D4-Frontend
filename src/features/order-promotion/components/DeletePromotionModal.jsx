import React from "react";
import { Card, CardContent } from "../../../components/ui/Card";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md rounded-[18px] border-danger/35 bg-[linear-gradient(165deg,rgba(255,255,255,0.03),transparent_35%),var(--color-surface)] text-text shadow-soft">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-danger">
              Delete Promotion
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold text-danger">
              Hapus Promo
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-[10px] border border-line-soft bg-white/[0.03] text-muted transition hover:border-line hover:bg-white/[0.07] hover:text-text"
          >
            x
          </button>
        </div>

        <Divider />

        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted">
            Apakah Anda yakin ingin menghapus kode promo ini? Tindakan ini
            tidak dapat dibatalkan.
          </p>

          <div className="rounded-[14px] border border-line-soft bg-white/[0.03] p-4">
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

          <p className="text-sm text-danger">
            Promo yang terhapus akan langsung hilang dari daftar promosi aktif.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>

            <Button variant="danger" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
