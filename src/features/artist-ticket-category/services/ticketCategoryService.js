import { apiFetch, parseJsonSafe } from "../../../lib/api";

const mapCategory = (c) => ({
  id: c.category_id,
  name: c.category_name,
  quota: Number(c.quota),
  price: Number(c.price),
  eventId: c.tevent_id,
  sisa_kuota: c.sisa_kuota !== undefined ? Number(c.sisa_kuota) : Number(c.quota),
});

export async function getTicketCategories(event_id) {
  const path = event_id
    ? `/ticket-categories?event_id=${event_id}`
    : "/ticket-categories";
  const res = await apiFetch(path);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat kategori tiket.");
  return Array.isArray(data) ? data.map(mapCategory) : [];
}

export async function createTicketCategory(payload) {
  const res = await apiFetch("/ticket-categories", {
    method: "POST",
    body: JSON.stringify({
      tevent_id: payload.eventId,
      category_name: payload.name,
      price: Number(payload.price),
      quota: Number(payload.quota),
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan kategori tiket.");
  return mapCategory(result);
}

export async function updateTicketCategory(id, payload) {
  const res = await apiFetch(`/ticket-categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      category_name: payload.name,
      price: Number(payload.price),
      quota: Number(payload.quota),
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan kategori tiket.");
  return mapCategory(result);
}

export async function deleteTicketCategory(id) {
  const res = await apiFetch(`/ticket-categories/${id}`, { method: "DELETE" });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menghapus kategori tiket.");
  return true;
}

export async function getEvents() {
  const res = await apiFetch("/events");
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat event.");
  return Array.isArray(data)
    ? data.map((e) => ({
        id: e.event_id,
        name: e.event_title,
        venueId: e.venue_id,
        organizerId: e.organizer_id,
        date: e.event_datetime,
      }))
    : [];
}

export async function getVenues() {
  const res = await apiFetch("/venues");
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat venue.");
  return Array.isArray(data)
    ? data.map((v) => ({
        id: v.venue_id,
        name: v.venue_name,
        capacity: v.capacity,
      }))
    : [];
}

export function resetTicketCategories() {}
