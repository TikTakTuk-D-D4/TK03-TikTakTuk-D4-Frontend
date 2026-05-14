import React, { useState } from "react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";
import { Badge } from "../../../components/ui/Badge";

import { applyPromoCode, formatCurrency } from "../utils/orderUtils";
import { normalizePromoCode } from "../utils/promotionUtils";

import {
  formatPromotionType,
  formatPromotionValue,
} from "../utils/promotionUtils";

export default function PromoCodeForm({
  promotions = [],
  appliedPromo = null,
  onApply,
  onRemove,
  className = "",
}) {
  const [promoCode, setPromoCode] = useState(appliedPromo?.promoCode || "");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleApplyPromo = () => {
    const normalizedCode = normalizePromoCode(promoCode);
    if (!normalizedCode) {
      setError("Kode promo wajib diisi.");
      setSuccessMessage("");
      onApply?.(null);
      return;
    }

    const result = applyPromoCode(promotions, promoCode);

    if (result.error) {
      if (result.error === "Kode promo tidak valid.") {
        setError("");
        setSuccessMessage("Kode promo akan divalidasi saat checkout.");
        onApply?.({ promoCode: normalizedCode });
        return;
      }

      setError(result.error);
      setSuccessMessage("");
      onApply?.(null);
      return;
    }

    setError("");
    setSuccessMessage("Kode promo berhasil diterapkan.");
    onApply?.(result.promo);
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setError("");
    setSuccessMessage("");
    onRemove?.();
  };

  const handleChange = (event) => {
    setPromoCode(event.target.value);
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  return (
    <div className={`space-y-4 text-text ${className}`}>
      <div>
        <p className="text-[11px] uppercase tracking-[0.5em] text-accent">
          Promo
        </p>

        <h3 className="mt-2 font-display text-lg font-semibold text-text">
          Kode Promo
        </h3>

        <p className="mt-1 text-sm text-muted">
          Gunakan kode promo untuk mendapatkan potongan harga.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          id="promo-code"
          placeholder="Contoh: TIKTAK20"
          value={promoCode}
          onChange={handleChange}
          error={error}
        />

        <Button
          type="button"
          variant="ghost"
          onClick={handleApplyPromo}
          disabled={!promoCode.trim()}
          className="border border-line-soft bg-white/[0.03] hover:border-line hover:bg-white/[0.07]"
        >
          Terapkan
        </Button>
      </div>

      {successMessage && appliedPromo && (
        <p className="text-xs text-ok">{successMessage}</p>
      )}

      {appliedPromo?.discountType ? (
        <>
          <Divider />

          <div className="rounded-[14px] border border-line bg-primary/15 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text">
                  Promo Digunakan
                </p>

                <p className="mt-1 font-mono text-xs text-accent">
                  {appliedPromo.promoCode}
                </p>
              </div>

              <Badge variant="success">
                {formatPromotionType(appliedPromo.discountType)}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span>Nilai Diskon</span>
                <span className="font-medium text-text">
                  {formatPromotionValue(
                    appliedPromo.discountType,
                    appliedPromo.discountValue
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Periode</span>
                <span className="font-medium text-text">
                  {appliedPromo.startDate} - {appliedPromo.endDate}
                </span>
              </div>

              {appliedPromo.discountType === "NOMINAL" && (
                <div className="flex items-center justify-between">
                  <span>Potongan</span>
                  <span className="font-medium text-ok">
                    {formatCurrency(appliedPromo.discountValue)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleRemovePromo}
                className="border border-line-soft bg-white/[0.03] text-muted hover:border-danger/40 hover:bg-danger/15 hover:text-danger"
              >
                Hapus Promo
              </Button>
            </div>
          </div>
        </>
      ) : appliedPromo?.promoCode ? (
        <>
          <Divider />

          <div className="rounded-[14px] border border-line bg-primary/15 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text">
                  Kode Akan Divalidasi
                </p>
                <p className="mt-1 font-mono text-xs text-accent">
                  {appliedPromo.promoCode}
                </p>
              </div>

              <Badge variant="secondary">Pending</Badge>
            </div>

            <p className="mt-3 text-sm text-muted">
              Diskon final akan ditentukan oleh backend saat checkout.
            </p>

            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={handleRemovePromo}
                className="border border-line-soft bg-white/[0.03] text-muted hover:border-danger/40 hover:bg-danger/15 hover:text-danger"
              >
                Hapus Promo
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
