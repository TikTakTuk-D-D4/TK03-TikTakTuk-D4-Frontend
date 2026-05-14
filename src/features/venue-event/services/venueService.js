import { apiFetch, API_URL } from "../../../lib/api";

const mapVenue = (v) => ({
  id: v.venue_id,
  venue_id: v.venue_id,
  name: v.venue_name,
  city: v.city,
  address: v.address,
  capacity: v.capacity,
  seatingType: v.seating_type || "free",
});

export const getVenues = async () => {
  const res = await fetch(`${API_URL}/venues`);
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapVenue) : [];
};

export const getVenueById = async (id) => {
  const res = await fetch(`${API_URL}/venues/${id}`);
  const data = await res.json();
  return mapVenue(data);
};

export const createVenue = async (data) => {
  const res = await apiFetch("/venues", {
    method: "POST",
    body: JSON.stringify({
      venue_name: data.name,
      city: data.city,
      address: data.address,
      capacity: data.capacity,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapVenue(result);
};

export const updateVenue = async (id, data) => {
  const res = await apiFetch(`/venues/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      venue_name: data.name,
      city: data.city,
      address: data.address,
      capacity: data.capacity,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return mapVenue(result);
};

export const deleteVenue = async (id) => {
  const res = await apiFetch(`/venues/${id}`, { method: "DELETE" });
  const result = await res.json();
  if (!res.ok) throw new Error(result.message);
  return result;
};

export const saveVenues = () => {};
