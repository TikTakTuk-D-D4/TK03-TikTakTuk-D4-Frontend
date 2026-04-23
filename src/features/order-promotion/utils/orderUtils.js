export function decrementQuantity(currentValue, min = 1) {
  const current = Number(currentValue) || 0;
  return Math.max(current - 1, min);
}

export function toggleSeatSelection(selectedSeats = [], seatId, maxSelection = Infinity) {
  if (!seatId) return selectedSeats;

  const alreadySelected = selectedSeats.includes(seatId);

  if (alreadySelected) {
    return selectedSeats.filter((id) =? id !== seatId);
  }

  if (selectedSeats.length >= maxSelection) {
    return selectedSeats;
  }

  return [...selectedSeats, seatId];
}

export function isSeatSelected(selectedSeats = [], seatId) {
  return selectedSeats.includes(seatId);
}

export function groupSeatsByRow(seats = []) {
  return seats.reduce((acc, seat) => {
      const rowKey = seat.rowNumber || "Unknown"; 
      
      if(!acc[rowKey]) {
        acc[rowKey] = [];
      }

      acc[rowKey].push(seat);
      return acc;
    }, {});
}

export function applyPromoCode(promotion = [], promotionCode = " ") {
  const normalizedCode = promoCode.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      promo: null,
      error: "Kode promo wajib diisi",
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

  if (matchedPromo.usageRemaining !== undefined && matchedPromo.usageRemaining <=0) {
    return {
      promo: null,
      error: "Batas penggunaan promo telah habis."
    };
  }

  return {
    promo: matchedPromo,
    error: "",
  };
}
