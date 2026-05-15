import { apiFetch, parseJsonSafe } from "../../../lib/api";

const mapSeat = (s) => ({
  seat_id: s.seat_id,
  venue_id: s.venue_id,
  section: s.section,
  row_number: s.row_number,
  seat_number: s.seat_number,
  is_taken: Boolean(s.is_taken),
  venue: { name: s.venue_name || "" },
  status: s.is_taken ? "Terpakai" : "Tersedia",
  seatLabel: `${s.section} - Baris ${s.row_number}, No. ${s.seat_number}`,
});

export async function getSeats(venue_id) {
  const path = venue_id ? `/seats?venue_id=${venue_id}` : "/seats";
  const res = await apiFetch(path);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat kursi.");
  return Array.isArray(data) ? data.map(mapSeat) : [];
}

export async function createSeat(payload) {
  const res = await apiFetch("/seats", {
    method: "POST",
    body: JSON.stringify({
      venue_id: payload.venue_id,
      section: payload.section,
      row_number: payload.row_number,
      seat_number: payload.seat_number,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal membuat kursi.");
  return mapSeat(result);
}

export async function updateSeat(id, payload) {
  const res = await apiFetch(`/seats/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      venue_id: payload.venue_id,
      section: payload.section,
      row_number: payload.row_number,
      seat_number: payload.seat_number,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal memperbarui kursi.");
  return mapSeat(result);
}

export async function deleteSeat(id) {
  const res = await apiFetch(`/seats/${id}`, { method: "DELETE" });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result.message || "Gagal menghapus kursi.");
  return true;
}
