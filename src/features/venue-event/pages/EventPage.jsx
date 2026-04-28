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

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) &&
    (venueFilter ? e.venueId === venueFilter : true)
  );

  const handleDelete = (id) => {
    if (confirm("Yakin hapus event ini?")) {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveEvents(updated);
    }
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">🎤 Events</h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search event..."
          className="px-3 py-2 rounded bg-gray-800"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded bg-gray-800"
          onChange={(e) => setVenueFilter(e.target.value)}
        >
          <option value="">All Venue</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>

        {/* 🔥 BUTTON KE PAGE CREATE */}
        <button
          onClick={() => navigate("/events/create")}
          className="bg-pink-500 px-4 py-2 rounded"
        >
          + Buat Event
        </button>
      </div>

      {/* LIST */}
      <div className="grid">
        {filtered.map((e) => (
          <div className="card" key={e.id}>
            <h3>{e.title}</h3>
            <p>🎶 {e.artist}</p>
            <p>📍 {e.venueName}</p>
            <p>📅 {e.date} ⏰ {e.time}</p>

            <p className="text-pink-500 font-bold">
              Rp {(Number(e.price) || 0).toLocaleString("id-ID")}
            </p>

            <button onClick={() => handleDelete(e.id)}>
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventPage;