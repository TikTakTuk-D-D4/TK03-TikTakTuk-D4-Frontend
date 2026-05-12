import { apiFetch, API_URL } from "../../../lib/api";

const toDbStatus = { PENDING: "Pending", PAID: "Paid", CANCELLED: "Cancelled" };
const normalizeStatus = (s) => toDbStatus[s?.toUpperCase()] || s;

const mapOrder = (o) => ({
  id: o.order_id,
  orderDate: o.order_date,
  paymentStatus: o.payment_status?.toUpperCase(),
  totalAmount: Number(o.total_amount),
  customerName: o.customer_name || "-",
  eventTitle: o.event_title || "-",
  itemCount: 1,
  customer_id: o.customer_id,
  promotions: o.promotions || [],
});

export async function getOrders(customer_id) {
  const url = customer_id
    ? `${API_URL}/orders?customer_id=${customer_id}`
    : `${API_URL}/orders`;
  const res = await fetch(url);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapOrder) : [];
}

export async function createOrder(payload) {
  const res = await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      customer_id: payload.customer_id,
      total_amount: payload.total_amount ?? payload.total_harga,
      payment_status: normalizeStatus(payload.payment_status || payload.status) || "Pending",
      promotion_id: payload.promotion_id || null,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapOrder(result);
}

export async function updateOrder(id, payload) {
  const res = await apiFetch(`/orders/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      total_amount: payload.totalAmount ?? payload.total_amount,
      payment_status: normalizeStatus(payload.paymentStatus || payload.payment_status),
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapOrder(result);
}

export async function deleteOrder(id) {
  const res = await apiFetch(`/orders/${id}`, { method: "DELETE" });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return true;
}
