import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { Divider } from "../../../components/ui/Divider";

import {
  validatePromotionForm,
  mapPromotionFormValues,
} from "../utils/promotionUtils";

import { DISCOUNT_TYPE_OPTIONS } from "../constants/promotionConstants";

function createInitialForm(mode, initialData) {
  if (mode === "update" && initialData) {
    return {
      promoCode: initialData.promoCode || "",
      discountType: initialData.discountType || "PERCENTAGE",
      discountValue: initialData.discountValue || "",
      startDate: initialData.startDate || "",
      endDate: initialData.endDate || "",
      usageLimit: initialData.usageLimit || "",
    };
  }

  return {
    promoCode: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
  };
}

export default function PromotionFormModal({
  isOpen,
  mode = "create", // "create" | "update"
  initialData = null,
  promotions = [],
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [form, setForm] = useState(() => createInitialForm(mode, initialData));
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = () => {
    const mapped = mapPromotionFormValues({
      ...form,
      promotionId: initialData?.promotionId,
      usedCount: initialData?.usedCount,
    });

    const { isValid, errors: validationErrors } =
      validatePromotionForm(mapped, promotions);

    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    onSubmit?.(mapped);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-xl rounded-[18px] border-line bg-[linear-gradient(165deg,rgba(255,255,255,0.03),transparent_35%),var(--color-surface)] text-text shadow-glow">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.45em] text-accent">
              {mode === "create" ? "Create Promotion" : "Update Promotion"}
            </p>
            <h2 className="mt-3 font-display text-xl font-semibold text-text">
              {mode === "create" ? "Buat Promo Baru" : "Edit Promo"}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Atur kode promo, periode aktif, dan batas penggunaan.
            </p>
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
          <Input
            label="Kode Promo"
            placeholder="CTH. TIKTAK20"
            value={form.promoCode}
            onChange={(e) => handleChange("promoCode", e.target.value)}
            error={errors.promoCode}
            className="uppercase"
          />

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Tipe Diskon
            </label>
            <select
              className="h-11 w-full rounded-[10px] border border-line-soft bg-white/[0.02] px-4 text-sm text-text outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
              value={form.discountType}
              onChange={(e) => handleChange("discountType", e.target.value)}
            >
              {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "PERCENTAGE" ? "Persentase (%)" : "Nominal"}
                </option>
              ))}
            </select>
            {errors.discountType && (
              <p className="mt-1.5 text-xs text-danger">
                {errors.discountType}
              </p>
            )}
          </div>

          <Input
            label="Nilai Diskon"
            type="number"
            placeholder={
              form.discountType === "PERCENTAGE" ? "cth. 20" : "cth. 50000"
            }
            value={form.discountValue}
            onChange={(e) => handleChange("discountValue", e.target.value)}
            error={errors.discountValue}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Tanggal Mulai"
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              error={errors.startDate}
            />

            <Input
              label="Tanggal Berakhir"
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              error={errors.endDate}
            />
          </div>

          <Input
            label="Batas Penggunaan"
            type="number"
            placeholder="1"
            value={form.usageLimit}
            onChange={(e) => handleChange("usageLimit", e.target.value)}
            error={errors.usageLimit}
          />

          <Divider />

          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>

            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading
                ? "Menyimpan..."
                : mode === "create"
                ? "Buat Promo"
                : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
