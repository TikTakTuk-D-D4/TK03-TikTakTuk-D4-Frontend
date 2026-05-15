import { apiFetch, parseJsonSafe } from "../../../lib/api";

const paymentToStatus = { Paid: "active", Pending: "pending", Cancelled: "cancelled" };

const mapTicket = (t) => ({
  ticket_id: t.ticket_id,
  ticket_code: t.ticket_code || t.ticket_id,
  tcategory_id: t.tcategory_id,
  torder_id: t.torder_id,
  status: paymentToStatus[t.order_status] || "active",
  category: t.tcategory_id
    ? { category_id: t.tcategory_id, category_name: t.category_name || "-", price: Number(t.price || 0) }
    : null,
  event: t.event_title
    ? { event_id: t.event_id, title: t.event_title || "-", event_datetime: t.event_datetime }
    : null,
  venue: t.venue_name
    ? { name: t.venue_name, seating_type: "free" }
    : null,
  seat: t.section
    ? { seat_id: t.seat_id, section: t.section, row_number: t.row_number, seat_number: t.seat_number }
    : null,
  order: t.order_id ? { order_id: t.order_id, customer_id: t.customer_id, payment_status: t.order_status } : null,
  customer: t.customer_name ? { full_name: t.customer_name, customer_id: t.customer_id } : null,
  seatLabel: t.section
    ? `${t.section} - Baris ${t.row_number}, No. ${t.seat_number}`
    : "Tanpa Kursi",
});

export async function getTickets(query = {}) {
  const params = new URLSearchParams();
  if (query.customer_id) params.set("customer_id", query.customer_id);
  if (query.event_id) params.set("event_id", query.event_id);
  const qs = params.toString();
  const res = await apiFetch(`/tickets${qs ? `?${qs}` : ""}`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat tiket.");
  return Array.isArray(data) ? data.map(mapTicket) : [];
}

export async function createTicket(payload) {
  const res = await apiFetch("/tickets", {
    method: "POST",
    body: JSON.stringify({
      tcategory_id: payload.tcategory_id || payload.category_id,
      torder_id: payload.torder_id || payload.order_id,
      seat_id: payload.seat_id || null,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal membuat tiket.");
  return result;
}

export async function updateTicketStatus(id, status, seat_id) {
  const res = await apiFetch(`/tickets/${id}`, {
    method: "PUT",
    body: JSON.stringify({ seat_id }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal memperbarui tiket.");
  return result;
}

export async function deleteTicket(id) {
  const res = await apiFetch(`/tickets/${id}`, { method: "DELETE" });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal menghapus tiket.");
  return true;
}

export async function getCustomers() {
  const res = await apiFetch("/auth/customers");
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat customer.");
  return Array.isArray(data) ? data : [];
}
