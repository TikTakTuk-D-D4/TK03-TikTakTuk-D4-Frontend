import {
  MAX_TICKETS_PER_TRANSACTION,
  PAYMENT_STATUS,
} from "../constants/orderConstants";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function calculateOrderTotal({
  price = 0,
  quantity = 0,
  promo = null,
  serviceFee = 0,
} = {}) {
  const safePrice = Math.max(toNumber(price), 0);
  const safeQuantity = Math.max(toNumber(quantity), 0);
  const safeServiceFee = Math.max(toNumber(serviceFee), 0);

  const subtotal = safePrice * safeQuantity;

  let discount = 0;
  if (promo) {
    const discountType = String(promo.discountType || "").toUpperCase();
    const discountValue = Math.max(toNumber(promo.discountValue), 0);

    if (discountType === "PERCENTAGE") {
      discount = subtotal * (discountValue / 100);
    } else if (discountType === "NOMINAL") {
      discount = discountValue;
    }
  }

  discount = Math.min(discount, subtotal);
  const total = Math.max(subtotal - discount + safeServiceFee, 0);

  return { subtotal, discount, total };
}

export function formatCurrency(value) {
  return currencyFormatter.format(Math.max(toNumber(value), 0));
}

export function validateTicketQuantity(
  quantity,
  { min = 1, max = MAX_TICKETS_PER_TRANSACTION } = {}
) {
  const safeQuantity = Number(quantity);

  if (!Number.isInteger(safeQuantity)) {
    return {
      isValid: false,
      message: "Jumlah tiket harus berupa bilangan bulat.",
    };
  }

  if (safeQuantity < min) {
    return {
      isValid: false,
      message: `Jumlah tiket minimal ${min}.`,
    };
  }

  if (safeQuantity > max) {
    return {
      isValid: false,
      message: `Jumlah tiket maksimal ${max}.`,
    };
  }

  return { isValid: true, message: "" };
}

export function validateSeatSelection({
  selectedSeats = [],
  quantity = 0,
  isReservedSeating = false,
} = {}) {
  if (!isReservedSeating) {
    return { isValid: true, message: "" };
  }

  const safeQuantity = Math.max(toNumber(quantity), 0);

  if (safeQuantity <= 0) {
    return {
      isValid: false,
      message: "Jumlah tiket tidak valid untuk pemilihan kursi.",
    };
  }

  if (selectedSeats.length !== safeQuantity) {
    return {
      isValid: false,
      message: "Jumlah kursi yang dipilih harus sama dengan jumlah tiket.",
    };
  }

  if (new Set(selectedSeats).size !== selectedSeats.length) {
    return {
      isValid: false,
      message: "Ada kursi duplikat dalam pilihan Anda.",
    };
  }

  return { isValid: true, message: "" };
}

export function incrementQuantity(currentValue, max = MAX_TICKETS_PER_TRANSACTION) {
  const current = Math.max(toNumber(currentValue), 0);
  const safeMax = Math.max(toNumber(max), 1);
  return Math.min(current + 1, safeMax);
}

export function decrementQuantity(currentValue, min = 1) {
  const current = Math.max(toNumber(currentValue), 0);
  const safeMin = Math.max(toNumber(min), 0);
  return Math.max(current - 1, safeMin);
}

export function groupSeatsByRow(seats = []) {
  return seats.reduce((acc, seat) => {
    const rowKey = seat.rowNumber || "Unknown";
    if (!acc[rowKey]) {
      acc[rowKey] = [];
    }
    acc[rowKey].push(seat);
    return acc;
  }, {});
}

export function toggleSeatSelection(
  selectedSeats = [],
  seatId,
  maxSelection = Infinity
) {
  if (!seatId) return selectedSeats;

  const alreadySelected = selectedSeats.includes(seatId);
  if (alreadySelected) {
    return selectedSeats.filter((id) => id !== seatId);
  }

  const safeMaxSelection = Math.max(toNumber(maxSelection), 1);
  if (selectedSeats.length >= safeMaxSelection) {
    return selectedSeats;
  }

  return [...selectedSeats, seatId];
}

export function isSeatSelected(selectedSeats = [], seatId) {
  return selectedSeats.includes(seatId);
}

export function getPaymentStatusLabel(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === PAYMENT_STATUS.PENDING) return "Pending";
  if (normalizedStatus === PAYMENT_STATUS.PAID) return "Lunas";
  if (normalizedStatus === PAYMENT_STATUS.CANCELLED) return "Dibatalkan";

  return "Tidak diketahui";
}

export function getPaymentStatusVariant(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === PAYMENT_STATUS.PENDING) return "warning";
  if (normalizedStatus === PAYMENT_STATUS.PAID) return "success";
  if (normalizedStatus === PAYMENT_STATUS.CANCELLED) return "danger";

  return "secondary";
}

export function applyPromoCode(promotions = [], promoCode = "") {
  const normalizedCode = String(promoCode).trim().toUpperCase();

  if (!normalizedCode) {
    return {
      promo: null,
      error: "Kode promo wajib diisi.",
    };
  }

  const matchedPromo = promotions.find(
    (item) => String(item.promoCode || "").toUpperCase() === normalizedCode
  );

  if (!matchedPromo) {
    return {
      promo: null,
      error: "Kode promo tidak valid.",
    };
  }

  const now = new Date();
  const startDate = matchedPromo.startDate ? new Date(matchedPromo.startDate) : null;
  const endDate = matchedPromo.endDate ? new Date(matchedPromo.endDate) : null;

  if (startDate && now < startDate) {
    return {
      promo: null,
      error: "Promo belum dapat digunakan.",
    };
  }

  if (endDate && now > endDate) {
    return {
      promo: null,
      error: "Promo sudah berakhir.",
    };
  }

  const usageLimit = Math.max(toNumber(matchedPromo.usageLimit), 0);
  const usedCount = Math.max(toNumber(matchedPromo.usedCount), 0);

  if (usageLimit > 0 && usedCount >= usageLimit) {
    return {
      promo: null,
      error: "Batas penggunaan promo telah habis.",
    };
  }

  return {
    promo: matchedPromo,
    error: "",
  };
}
