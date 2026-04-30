// src/features/order-promotion/utils/promotionUtils.js

export function normalizePromoCode(code = "") {
  return String(code).trim().toUpperCase();
}

export function formatPromotionValue(discountType, discountValue) {
  const safeValue = Number(discountValue) || 0;

  if (discountType === "PERCENTAGE") {
    return `${safeValue}%`;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(safeValue);
}

export function formatPromotionType(discountType) {
  const normalizedType = String(discountType || "").toUpperCase();

  const typeMap = {
    PERCENTAGE: "Persentase",
    NOMINAL: "Nominal",
  };

  return typeMap[normalizedType] || discountType;
}

export function formatPromotionUsage(usedCount = 0, usageLimit = 0) {
  const safeUsed = Number(usedCount) || 0;
  const safeLimit = Number(usageLimit) || 0;

  return `${safeUsed} / ${safeLimit}`;
}

export function calculateUsageRemaining(usedCount = 0, usageLimit = 0) {
  const safeUsed = Number(usedCount) || 0;
  const safeLimit = Number(usageLimit) || 0;

  return Math.max(safeLimit - safeUsed, 0);
}

export function isPromotionActive(promotion, referenceDate = new Date()) {
  if (!promotion) return false;

  const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
  const endDate = promotion.endDate ? new Date(promotion.endDate) : null;

  if (startDate && referenceDate < startDate) return false;
  if (endDate && referenceDate > endDate) return false;

  return true;
}

export function getPromotionStatus(promotion, referenceDate = new Date()) {
  if (!promotion) return "UNKNOWN";

  const startDate = promotion.startDate ? new Date(promotion.startDate) : null;
  const endDate = promotion.endDate ? new Date(promotion.endDate) : null;
  const usageRemaining = calculateUsageRemaining(
    promotion.usedCount,
    promotion.usageLimit
  );

  if (usageRemaining <= 0) return "EXHAUSTED";
  if (startDate && referenceDate < startDate) return "SCHEDULED";
  if (endDate && referenceDate > endDate) return "EXPIRED";
  if (isPromotionActive(promotion, referenceDate)) return "ACTIVE";

  return "UNKNOWN";
}

export function getPromotionStatusLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  const statusMap = {
    ACTIVE: "Aktif",
    SCHEDULED: "Terjadwal",
    EXPIRED: "Berakhir",
    EXHAUSTED: "Habis",
    UNKNOWN: "Tidak diketahui",
  };

  return statusMap[normalizedStatus] || status;
}

export function getPromotionStatusVariant(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  const variantMap = {
    ACTIVE: "success",
    SCHEDULED: "secondary",
    EXPIRED: "danger",
    EXHAUSTED: "warning",
    UNKNOWN: "secondary",
  };

  return variantMap[normalizedStatus] || "secondary";
}

export function validatePromotionForm(values = {}, existingPromotions = []) {
  const errors = {};

  const promoCode = normalizePromoCode(values.promoCode);
  const discountType = String(values.discountType || "").toUpperCase();
  const discountValue = Number(values.discountValue);
  const usageLimit = Number(values.usageLimit);
  const startDate = values.startDate ? new Date(values.startDate) : null;
  const endDate = values.endDate ? new Date(values.endDate) : null;
  const promotionId = values.promotionId || null;

  if (!promoCode) {
    errors.promoCode = "Kode promo wajib diisi.";
  } else {
    const isDuplicate = existingPromotions.some((promo) => {
      const sameCode = normalizePromoCode(promo.promoCode) === promoCode;
      const sameRecord = promo.promotionId === promotionId;
      return sameCode && !sameRecord;
    });

    if (isDuplicate) {
      errors.promoCode = "Kode promo harus unik.";
    }
  }

  if (!["PERCENTAGE", "NOMINAL"].includes(discountType)) {
    errors.discountType = "Tipe diskon harus Persentase atau Nominal.";
  }

  if (Number.isNaN(discountValue) || discountValue <= 0) {
    errors.discountValue = "Nilai diskon harus lebih dari 0.";
  }

  if (discountType === "PERCENTAGE" && discountValue > 100) {
    errors.discountValue = "Diskon persentase tidak boleh lebih dari 100%.";
  }

  if (!values.startDate) {
    errors.startDate = "Tanggal mulai wajib diisi.";
  }

  if (!values.endDate) {
    errors.endDate = "Tanggal berakhir wajib diisi.";
  }

  if (startDate && endDate && endDate < startDate) {
    errors.endDate = "Tanggal berakhir harus sama dengan atau setelah tanggal mulai.";
  }

  if (Number.isNaN(usageLimit) || !Number.isInteger(usageLimit) || usageLimit <= 0) {
    errors.usageLimit = "Batas penggunaan harus bilangan bulat positif.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function filterPromotions(promotions = [], filters = {}) {
  const {
    search = "",
    discountType = "ALL",
    status = "ALL",
  } = filters;

  const normalizedSearch = normalizePromoCode(search);
  const normalizedType = String(discountType || "ALL").toUpperCase();
  const normalizedStatus = String(status || "ALL").toUpperCase();

  return promotions.filter((promotion) => {
    const promoCode = normalizePromoCode(promotion.promoCode);
    const promotionType = String(promotion.discountType || "").toUpperCase();
    const promotionStatus = getPromotionStatus(promotion);

    const matchesSearch =
      !normalizedSearch || promoCode.includes(normalizedSearch);

    const matchesType =
      normalizedType === "ALL" || promotionType === normalizedType;

    const matchesStatus =
      normalizedStatus === "ALL" || promotionStatus === normalizedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });
}

export function sortPromotions(promotions = [], sortBy = "promoCode", direction = "asc") {
  const sorted = [...promotions].sort((a, b) => {
    let valueA = a[sortBy];
    let valueB = b[sortBy];

    if (sortBy === "promoCode" || sortBy === "discountType") {
      valueA = String(valueA || "").toUpperCase();
      valueB = String(valueB || "").toUpperCase();
    }

    if (sortBy === "startDate" || sortBy === "endDate") {
      valueA = valueA ? new Date(valueA).getTime() : 0;
      valueB = valueB ? new Date(valueB).getTime() : 0;
    }

    if (valueA < valueB) return direction === "asc" ? -1 : 1;
    if (valueA > valueB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function getPromotionStats(promotions = []) {
  const totalPromo = promotions.length;

  const totalUsage = promotions.reduce((sum, promotion) => {
    return sum + (Number(promotion.usedCount) || 0);
  }, 0);

  const totalPercentageType = promotions.filter(
    (promotion) => String(promotion.discountType || "").toUpperCase() === "PERCENTAGE"
  ).length;

  const activePromo = promotions.filter(
    (promotion) => getPromotionStatus(promotion) === "ACTIVE"
  ).length;

  return {
    totalPromo,
    totalUsage,
    totalPercentageType,
    activePromo,
  };
}

export function mapPromotionFormValues(values = {}) {
  return {
    promotionId: values.promotionId || "",
    promoCode: normalizePromoCode(values.promoCode || ""),
    discountType: String(values.discountType || "").toUpperCase(),
    discountValue: Number(values.discountValue) || 0,
    startDate: values.startDate || "",
    endDate: values.endDate || "",
    usageLimit: Number(values.usageLimit) || 0,
    usedCount: Number(values.usedCount) || 0,
  };
}
