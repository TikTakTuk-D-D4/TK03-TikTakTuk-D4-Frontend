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

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) &&
    (cityFilter ? v.city === cityFilter : true) &&
    (seatingFilter ? v.seatingType === seatingFilter : true)
  );

  const openCreate = () => {
    navigate("/venues/create");
  };

  const openEdit = (venue) => {
    navigate(`/venues/edit/${venue.id}`);
  };

  const handleDelete = (id) => {
    if (confirm("Yakin hapus venue ini?")) {
      const updated = venues.filter((v) => v.id !== id);
      setVenues(updated);
      saveVenues(updated);
    }
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">🏟️ Venue</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search venue..."
          className="px-3 py-2 rounded bg-gray-800"
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="Filter kota"
          className="px-3 py-2 rounded bg-gray-800"
          onChange={(e) => setCityFilter(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded bg-gray-800"
          onChange={(e) => setSeatingFilter(e.target.value)}
        >
          <option value="">All Seating</option>
          <option value="free">Free</option>
          <option value="reserved">Reserved</option>
        </select>

        {isAdminOrOrganizer() && (
          <button
            onClick={openCreate}
            className="bg-pink-500 px-4 py-2 rounded hover:bg-pink-600"
          >
            + Tambah Venue
          </button>
        )}
      </div>

      <div className="grid">
        {filtered.map((v) => (
          <div className="card" key={v.id}>
            <h3 className="text-pink-400 text-xl">{v.name}</h3>
            <p>{v.city}</p>
            <p>{v.address}</p>
            <p>{v.capacity} orang</p>
            <p className="text-gray-400">{v.seatingType}</p>

            {isAdminOrOrganizer() && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(v)}
                  className="bg-yellow-500 px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
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