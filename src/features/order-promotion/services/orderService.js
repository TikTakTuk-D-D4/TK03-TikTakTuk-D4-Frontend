import { apiFetch, API_URL } from "../../../lib/api";

const toDbStatus = { PENDING: "Pending", PAID: "Paid", CANCELLED: "Cancelled" };
const normalizeStatus = (s) => toDbStatus[s?.toUpperCase()] || s;
const toUiStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

function unwrapApiData(payload) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }

  return payload;
}

function buildScopeParams(user = {}) {
  const role = String(user?.role || "CUSTOMER").toUpperCase();
  const params = new URLSearchParams();

  params.set("role", role);
  if (user?.user_id) params.set("userId", user.user_id);
  if (user?.customer_id) params.set("customerId", user.customer_id);
  if (user?.organizer_id) params.set("organizerId", user.organizer_id);

  return params;
}

const mapOrder = (o) => ({
  id: o.order_id || o.id,
  orderDate: o.order_date || o.orderDate,
  paymentStatus:
    toUiStatus[String(o.payment_status || o.paymentStatus || "").toUpperCase()] ||
    String(o.payment_status || o.paymentStatus || "").toUpperCase(),
  totalAmount: Number(o.total_amount ?? o.totalAmount ?? 0),
  customerName: o.customer_name || "-",
  eventTitle: o.event_title || o.eventTitle || "-",
  itemCount: Number(o.ticket_count) || 1,
  customer_id: o.customer_id,
  promotions: o.promotions || o.promo_codes || [],
});

export async function getOrders(user = {}) {
  const params = buildScopeParams(user);
  const url = `${API_URL}/orders?${params.toString()}`;
  const res = await fetch(url);
  const payload = await res.json();

  if (!res.ok) {
    throw new Error(payload?.message || "Gagal memuat order.");
  }

  const data = unwrapApiData(payload);
  const orders = Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data)
      ? data
      : [];

  return orders.map(mapOrder);
}

export async function createOrder(payload, user = {}) {
  const res = await apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      role: String(user?.role || "CUSTOMER").toUpperCase(),
      userId: user?.user_id || undefined,
      organizerId: user?.organizer_id || undefined,
      customerId: user?.customer_id || undefined,
      user_id: user?.user_id || undefined,
      customer_id: payload.customer_id || user?.customer_id || undefined,
      event_id: payload.event_id,
      category_id: payload.category_id,
      quantity: payload.quantity,
      seat_ids: payload.seat_ids || [],
      promo_code: payload.promo_code || undefined,
    }),
  });
  const payloadResult = await res.json();
  if (!res.ok) throw new Error(payloadResult?.message || "Gagal membuat order.");

  return mapOrder(unwrapApiData(payloadResult));
}

export async function updateOrder(id, payload, user = {}) {
  const res = await apiFetch(`/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      role: String(user?.role || "CUSTOMER").toUpperCase(),
      userId: user?.user_id || undefined,
      customerId: user?.customer_id || undefined,
      organizerId: user?.organizer_id || undefined,
      payment_status: normalizeStatus(payload.paymentStatus || payload.payment_status),
    }),
  });
  const payloadResult = await res.json();
  if (!res.ok) throw new Error(payloadResult?.message || "Gagal mengubah order.");
  return mapOrder(unwrapApiData(payloadResult));
}

export async function deleteOrder(id, user = {}) {
  const params = buildScopeParams(user);
  const res = await apiFetch(`/orders/${id}?${params.toString()}`, {
    method: "DELETE",
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.message || "Gagal menghapus order.");
  return true;
}
