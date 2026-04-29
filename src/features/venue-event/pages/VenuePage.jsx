import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVenues, saveVenues } from "../services/venueService";
import { isAdminOrOrganizer } from "../../auth/services/authService";

function VenuePage() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [seatingFilter, setSeatingFilter] = useState("");

  useEffect(() => {
    setVenues(getVenues());
  }, []);

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(search.toLowerCase()) &&
      (cityFilter
        ? venue.city.toLowerCase().includes(cityFilter.toLowerCase())
        : true) &&
      (seatingFilter ? venue.seatingType === seatingFilter : true)
  );

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus venue ini?")) return;

    const updated = venues.filter((v) => v.id !== id);
    setVenues(updated);
    saveVenues(updated);
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">🏟️ Venue</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search venue..."
          className="px-3 py-2 rounded bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Kota"
          className="px-3 py-2 rounded bg-gray-800"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded bg-gray-800"
          value={seatingFilter}
          onChange={(e) => setSeatingFilter(e.target.value)}
        >
          <option value="">All Seating</option>
          <option value="free">Free</option>
          <option value="reserved">Reserved</option>
        </select>

        {isAdminOrOrganizer() && (
          <button
            onClick={() => navigate("/venues/create")}
            className="bg-pink-500 px-4 py-2 rounded"
          >
            + Tambah Venue
          </button>
        )}
      </div>

      <div className="grid">
        {filteredVenues.map((venue) => (
          <div className="card" key={venue.id}>
            <h3>{venue.name}</h3>
            <p>🏙️ {venue.city}</p>
            <p>📍 {venue.address}</p>
            <p>👥 {venue.capacity} orang</p>
            <p>🪑 {venue.seatingType}</p>

            {isAdminOrOrganizer() && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/venues/edit/${venue.id}`)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(venue.id)}>
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VenuePage;