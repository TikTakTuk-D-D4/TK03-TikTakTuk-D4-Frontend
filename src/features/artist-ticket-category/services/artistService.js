import { apiFetch, parseJsonSafe } from "../../../lib/api";

const mapArtist = (a) => ({ id: a.artist_id, artist_id: a.artist_id, name: a.name, genre: a.genre });

export async function getArtists() {
  const res = await apiFetch("/artists");
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat artist.");
  return Array.isArray(data) ? data.map(mapArtist) : [];
}

export async function createArtist(payload) {
  const res = await apiFetch("/artists", {
    method: "POST",
    body: JSON.stringify({
      name: payload.name,
      genre: payload.genre || null,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan artist.");
  return { id: result.artist_id, name: result.name, genre: result.genre };
}

export async function updateArtist(id, payload) {
  const res = await apiFetch(`/artists/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: payload.name,
      genre: payload.genre || null,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan artist.");
  return { id: result.artist_id, name: result.name, genre: result.genre };
}

export async function deleteArtist(id) {
  const res = await apiFetch(`/artists/${id}`, { method: "DELETE" });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menghapus artist.");
  return true;
}

export async function getArtistsByEvent(event_id) {
  const res = await apiFetch(`/event-artists/${event_id}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal memuat artist event.");
  return result;
}

export async function addArtistToEvent(event_id, artist_id, role) {
  const res = await apiFetch("/event-artists", {
    method: "POST",
    body: JSON.stringify({ event_id, artist_id, role }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menambahkan artist ke event.");
  return result;
}

export async function removeArtistFromEvent(event_id, artist_id) {
  const res = await apiFetch(`/event-artists/${event_id}/${artist_id}`, {
    method: "DELETE",
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menghapus artist dari event.");
  return result;
}

export async function getTicketQuota(event_id) {
  const res = await apiFetch(`/event-artists/quota/${event_id}`);
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal memuat kuota tiket.");
  return result;
}

export function resetArtists() {}
