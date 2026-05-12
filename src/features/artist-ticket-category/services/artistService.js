import { apiFetch, API_URL } from "../../../lib/api";

const mapArtist = (a) => ({ id: a.artist_id, artist_id: a.artist_id, name: a.name, genre: a.genre });

export async function getArtists() {
  const res = await fetch(`${API_URL}/artists`);
  const data = await res.json();
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
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
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
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return { id: result.artist_id, name: result.name, genre: result.genre };
}

export async function deleteArtist(id) {
  const res = await apiFetch(`/artists/${id}`, { method: "DELETE" });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return true;
}

export async function getArtistsByEvent(event_id) {
  const res = await fetch(`${API_URL}/event-artists/${event_id}`);
  return res.json();
}

export async function addArtistToEvent(event_id, artist_id, role) {
  const res = await apiFetch("/event-artists", {
    method: "POST",
    body: JSON.stringify({ event_id, artist_id, role }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export async function removeArtistFromEvent(event_id, artist_id) {
  const res = await apiFetch(`/event-artists/${event_id}/${artist_id}`, {
    method: "DELETE",
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export async function getTicketQuota(event_id) {
  const res = await fetch(`${API_URL}/event-artists/quota/${event_id}`);
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
}

export function resetArtists() {}
