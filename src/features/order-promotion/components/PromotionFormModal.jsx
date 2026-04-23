import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/layout/Card";
import { Input } from "../../../components/ui/layout/Input";
import { Button } from "../../../components/ui/layout/Button";
import { Divider } from "../../../components/ui/layout/Divider";

import {
  validatePromotionForm,
  mapPromotionFormValues,
} from "../utils/promotionUtils";

import { DISCOUNT_TYPE_OPTIONS } from "../constants/promotionConstants";

export default function PromotionFormModal({
  isOpen,
  mode = "create", // "create" | "update"
  initialData = null,
  promotions = [],
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [form, setForm] = useState({
    promoCode: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === "update" && initialData) {
      setForm({
        promoCode: initialData.promoCode || "",
        discountType: initialData.discountType || "PERCENTAGE",
        discountValue: initialData.discountValue || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        usageLimit: initialData.usageLimit || "",
      });
    } else {
      setForm({
        promoCode: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
      });
    }

    setErrors({});
  }, [mode, initialData, isOpen]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Buat Promo" : "Update Promo"}
          </CardTitle>
        </CardHeader>

        <Divider />

        <CardContent className="space-y-4 pt-4">
          {/* Promo Code */}
          <Input
            label="Kode Promo"
            value={form.promoCode}
            onChange={(e) => handleChange("promoCode", e.target.value)}
            error={errors.promoCode}
          />

          {/* Discount Type */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipe Diskon
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={form.discountType}
              onChange={(e) => handleChange("discountType", e.target.value)}
            >
              {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.discountType && (
              <p className="mt-1 text-sm text-red-500">
                {errors.discountType}
              </p>
            )}
          </div>

          {/* Discount Value */}
          <Input
            label="Nilai Diskon"
            type="number"
            value={form.discountValue}
            onChange={(e) => handleChange("discountValue", e.target.value)}
            error={errors.discountValue}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
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

          {/* Usage Limit */}
          <Input
            label="Batas Penggunaan"
            type="number"
            value={form.usageLimit}
            onChange={(e) => handleChange("usageLimit", e.target.value)}
            error={errors.usageLimit}
          />

          <Divider />

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
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
