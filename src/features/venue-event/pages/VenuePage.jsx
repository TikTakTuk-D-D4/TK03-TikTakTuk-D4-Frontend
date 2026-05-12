import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVenues, deleteVenue } from "../services/venueService";
import { isAdminOrOrganizer } from "../../auth/services/authService";

function VenuePage() {
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVenues()
      .then(setVenues)
      .finally(() => setLoading(false));
  }, []);

  const filteredVenues = venues.filter(
    (venue) =>
      venue.name?.toLowerCase().includes(search.toLowerCase()) &&
      (cityFilter ? venue.city?.toLowerCase().includes(cityFilter.toLowerCase()) : true)
  );

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus venue ini?")) return;
    try {
      await deleteVenue(id);
      setVenues((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="page"><p>Memuat data venue...</p></div>;

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
