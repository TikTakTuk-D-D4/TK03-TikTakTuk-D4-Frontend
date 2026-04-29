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
      (cityFilter ? venue.city.toLowerCase().includes(cityFilter.toLowerCase()) : true) &&
      (seatingFilter ? venue.seatingType === seatingFilter : true)
  );

  const handleDelete = (id) => {
    if (!confirm("Yakin hapus venue ini?")) return;
    const updated = venues.filter((v) => v.id !== id);
    setVenues(updated);
    saveVenues(updated);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">🏟️ Venue</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input className="input" placeholder="Search venue..."
          value={search} onChange={(e) => setSearch(e.target.value)}
        />

        <input className="input" placeholder="Kota"
          value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
        />

        <select className="input"
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
            className="bg-pink-500 px-5 py-3 rounded-xl"
          >
            + Tambah Venue
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVenues.map((v) => (
          <div key={v.id} className="card">
            <h3 className="text-xl font-bold text-pink-400">{v.name}</h3>
            <p>{v.city}</p>
            <p>{v.address}</p>
            <p>{v.capacity} orang</p>
            <p className="text-gray-400">{v.seatingType}</p>

            {isAdminOrOrganizer() && (
              <div className="flex gap-2 mt-4">
                <button className="btn" onClick={() => navigate(`/venues/edit/${v.id}`)}>
                  Edit
                </button>
                <button className="btn-danger" onClick={() => handleDelete(v.id)}>
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .input {
          padding: 12px 14px;
          border-radius: 12px;
          background: #1f1f1f;
          border: 1px solid #2a2a2a;
        }
        .card {
          background: #1a1a1a;
          padding: 18px;
          border-radius: 16px;
          border: 1px solid #2a2a2a;
        }
        .btn {
          flex: 1;
          padding: 8px;
          background: #333;
          border-radius: 10px;
        }
        .btn-danger {
          flex: 1;
          padding: 8px;
          background: #ef4444;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default VenuePage;