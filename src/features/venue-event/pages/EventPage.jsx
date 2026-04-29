import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, saveEvents } from "../services/eventService";
import { getVenues } from "../services/venueService";

function EventPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  useEffect(() => {
    setEvents(getEvents());
    setVenues(getVenues());
  }, []);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      (venueFilter ? event.venueId === Number(venueFilter) : true)
  );

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus event ini?")) return;

    const updatedEvents = events.filter((event) => event.id !== id);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">🎤 Events</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search event..."
          className="px-3 py-2 rounded bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded bg-gray-800"
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
        >
          <option value="">All Venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => navigate("/events/create")}
          className="bg-pink-500 px-4 py-2 rounded"
        >
          + Buat Event
        </button>
      </div>

      <div className="grid">
        {filteredEvents.map((event) => (
          <div className="card" key={event.id}>
            <h3>{event.title}</h3>
            <p>🎶 {event.artist}</p>
            <p>📍 {event.venueName}</p>
            <p>
              📅 {event.date} ⏰ {event.time}
            </p>

            <p className="text-pink-500 font-bold">
              Rp {(Number(event.price) || 0).toLocaleString("id-ID")}
            </p>

            <div className="flex gap-2 mt-3">
              <button onClick={() => navigate(`/events/edit/${event.id}`)}>
                Edit
              </button>

              <button onClick={() => handleDelete(event.id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventPage;