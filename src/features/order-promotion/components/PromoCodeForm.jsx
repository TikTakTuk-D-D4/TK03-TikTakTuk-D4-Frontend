import React, { useState } from "react";
import { Input } from "../../../components/ui/layout/Input";
import { Button } from "../../../components/ui/layout/Button";
import { Divider } from "../../../components/ui/layout/Divider";
import { Badge } from "../../../components/ui/layout/Badge";

import {
  applyPromoCode,
  formatCurrency,
} from "../utils/orderUtils";

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
    const result = applyPromoCode(promotions, promoCode);

    if (result.error) {
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
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-3">
        <Input
          id="promo-code"
          label="Kode Promo"
          placeholder="Masukkan kode promo"
          value={promoCode}
          onChange={handleChange}
          error={error}
        />

        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={handleApplyPromo}
          disabled={!promoCode.trim()}
        >
          Terapkan
        </Button>

        {successMessage && !appliedPromo && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
      </div>

      {appliedPromo && (
        <>
          <Divider />

          <div className="rounded-2xl border border-line-soft bg-gray-50 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text">
                  Promo Digunakan
                </p>
                <p className="text-sm text-gray-600">
                  {appliedPromo.promoCode}
                </p>
              </div>

              <Badge variant="success">
                {formatPromotionType(appliedPromo.discountType)}
              </Badge>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
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

              {typeof appliedPromo.usageRemaining === "number" && (
                <div className="flex items-center justify-between">
                  <span>Sisa Penggunaan</span>
                  <span className="font-medium text-text">
                    {appliedPromo.usageRemaining}
                  </span>
                </div>
              )}

              {appliedPromo.discountType === "NOMINAL" && (
                <div className="flex items-center justify-between">
                  <span>Potongan Maksimal</span>
                  <span className="font-medium text-green-600">
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
              >
                Hapus Promo
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
