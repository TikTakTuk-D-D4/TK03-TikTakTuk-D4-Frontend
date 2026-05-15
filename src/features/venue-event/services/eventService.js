import { apiFetch, parseJsonSafe } from "../../../lib/api";

const mapEvent = (e) => {
  const dt = e.event_datetime ? new Date(e.event_datetime) : null;
  return {
    id: e.event_id,
    name: e.event_title,
    title: e.event_title,
    venueId: e.venue_id,
    venueName: e.venue_name || "",
    city: e.city || "",
    organizerId: e.organizer_id,
    date: dt ? dt.toISOString().slice(0, 10) : "",
    time: dt ? dt.toISOString().slice(11, 16) : "",
    event_datetime: e.event_datetime,
    description: e.description || "",
    status: e.status || "",
  };
};

export const getEvents = async () => {
  const res = await apiFetch("/events");
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat event.");
  return Array.isArray(data) ? data.map(mapEvent) : [];
};

export const getEventById = async (id) => {
  const res = await apiFetch(`/events/${id}`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.message || "Gagal memuat detail event.");
  return mapEvent(data);
};

export const createEvent = async (data) => {
  const event_datetime = data.event_datetime || (data.date
    ? `${data.date}T${data.time || "00:00"}:00`
    : null);
  const res = await apiFetch("/events", {
    method: "POST",
    body: JSON.stringify({
      venue_id: data.venueId,
      organizer_id: data.organizerId,
      event_title: data.title || data.name,
      event_datetime,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan event.");
  return mapEvent(result);
};

export const updateEvent = async (id, data) => {
  const event_datetime = data.event_datetime || (data.date
    ? `${data.date}T${data.time || "00:00"}:00`
    : null);
  const res = await apiFetch(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      venue_id: data.venueId,
      event_title: data.title || data.name,
      event_datetime,
    }),
  });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menyimpan event.");
  return mapEvent(result);
};

export const deleteEvent = async (id) => {
  const res = await apiFetch(`/events/${id}`, { method: "DELETE" });
  const result = await parseJsonSafe(res);
  if (!res.ok) throw new Error(result?.message || "Gagal menghapus event.");
  return result;
};

export const saveEvents = () => {};
