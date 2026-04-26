import { useEffect, useState } from "react";
import { getVenues } from "../services/venueService";
import { isAdminOrOrganizer } from "../../auth/services/authService";

function VenuePage() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [seatingFilter, setSeatingFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    capacity: "",
    seatingType: "free",
  });

  useEffect(() => {
    setVenues(getVenues());
  }, []);

  // FILTER
  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) &&
    (cityFilter ? v.city === cityFilter : true) &&
    (seatingFilter ? v.seatingType === seatingFilter : true)
  );

  // OPEN CREATE
  const openCreate = () => {
    setEditMode(false);
    setForm({
      name: "",
      city: "",
      address: "",
      capacity: "",
      seatingType: "free",
    });
    setShowModal(true);
  };

  // OPEN EDIT
  const openEdit = (venue) => {
    setEditMode(true);
    setSelectedId(venue.id);
    setForm(venue);
    setShowModal(true);
  };

  // SAVE (CREATE / UPDATE)
  const handleSave = () => {
    if (editMode) {
      setVenues(
        venues.map((v) =>
          v.id === selectedId ? { ...form, id: selectedId } : v
        )
      );
    } else {
      const newVenue = {
        ...form,
        id: Date.now(),
      };
      setVenues([...venues, newVenue]);
    }
    setShowModal(false);
  };

  // DELETE
  const handleDelete = (id) => {
    if (confirm("Yakin hapus venue ini?")) {
      setVenues(venues.filter((v) => v.id !== id));
    }
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">🏟️ Venue</h1>

      {/* FILTER */}
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

      {/* LIST */}
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
                  className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-xl w-96">
            <h2 className="text-xl mb-4">
              {editMode ? "Edit Venue" : "Tambah Venue"}
            </h2>

            <input
              placeholder="Nama"
              value={form.name}
              className="w-full mb-2 p-2 bg-gray-800"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              placeholder="Kota"
              value={form.city}
              className="w-full mb-2 p-2 bg-gray-800"
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />

            <input
              placeholder="Alamat"
              value={form.address}
              className="w-full mb-2 p-2 bg-gray-800"
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Capacity"
              value={form.capacity}
              className="w-full mb-2 p-2 bg-gray-800"
              onChange={(e) =>
                setForm({ ...form, capacity: e.target.value })
              }
            />

            <select
              value={form.seatingType}
              className="w-full mb-3 p-2 bg-gray-800"
              onChange={(e) =>
                setForm({ ...form, seatingType: e.target.value })
              }
            >
              <option value="free">Free Seating</option>
              <option value="reserved">Reserved Seating</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-pink-500 px-4 py-2 rounded hover:bg-pink-600"
              >
                {editMode ? "Simpan" : "Tambah"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VenuePage;