import { apiFetch, API_URL } from "../../../lib/api";

const mapPromotion = (p) => ({
  promotionId: p.promotion_id,
  promoCode: p.promo_code,
  discountType: p.discount_type,
  discountValue: Number(p.discount_value),
  usageLimit: p.usage_limit,
  startDate: p.start_date,
  endDate: p.end_date,
});

export async function getPromotions() {
  const res = await fetch(`${API_URL}/promotions`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapPromotion) : [];
}

export async function createPromotion(payload) {
  const res = await apiFetch("/promotions", {
    method: "POST",
    body: JSON.stringify({
      promo_code: payload.promoCode,
      discount_type: payload.discountType || "NOMINAL",
      discount_value: payload.discountValue,
      usage_limit: payload.usageLimit,
      start_date: payload.startDate,
      end_date: payload.endDate,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapPromotion(result);
}

export async function updatePromotion(id, payload) {
  const res = await apiFetch(`/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      promo_code: payload.promoCode,
      discount_type: payload.discountType || "NOMINAL",
      discount_value: payload.discountValue,
      usage_limit: payload.usageLimit,
      start_date: payload.startDate,
      end_date: payload.endDate,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapPromotion(result);
}

export async function deletePromotion(id) {
  const res = await apiFetch(`/promotions/${id}`, { method: "DELETE" });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return true;
}

export async function getPromotionByCode(code) {
  const res = await fetch(`${API_URL}/promotions/code/${code}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapPromotion(result);
}
