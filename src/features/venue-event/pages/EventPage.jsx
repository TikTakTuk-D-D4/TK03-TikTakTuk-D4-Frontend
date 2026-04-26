import { useEffect, useState } from "react";
import { getEvents } from "../services/eventService";
import { getVenues } from "../services/venueService";
import { isAdminOrOrganizer } from "../../auth/services/authService";

function EventPage() {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);

  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venueId: "",
    artist: "",
    description: "",
    price: "",
  });

  useEffect(() => {
    setEvents(getEvents());
    setVenues(getVenues());
  }, []);

  // FILTER
  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) &&
    (venueFilter ? e.venueId === venueFilter : true)
  );

  // OPEN CREATE
  const openCreate = () => {
    setEditMode(false);
    setForm({
      title: "",
      date: "",
      time: "",
      venueId: "",
      artist: "",
      description: "",
      price: "",
    });
    setShowModal(true);
  };

  // OPEN EDIT
  const openEdit = (event) => {
    setEditMode(true);
    setSelectedId(event.id);
    setForm(event);
    setShowModal(true);
  };

  // SAVE
  const handleSave = () => {
    const venue = venues.find((v) => v.id == form.venueId);

    const newData = {
      ...form,
      id: editMode ? selectedId : Date.now(),
      venueName: venue?.name || "",
    };

    if (editMode) {
      setEvents(events.map((e) => (e.id === selectedId ? newData : e)));
    } else {
      setEvents([...events, newData]);
    }

    setShowModal(false);
  };

  // DELETE
  const handleDelete = (id) => {
    if (confirm("Yakin hapus event ini?")) {
      setEvents(events.filter((e) => e.id !== id));
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

        {isAdminOrOrganizer() && (
          <button
            onClick={openCreate}
            className="bg-pink-500 px-4 py-2 rounded hover:bg-pink-600"
          >
            + Buat Event
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="grid">
        {filtered.map((e) => (
          <div className="card" key={e.id}>
            <h3 className="text-pink-400 text-xl">{e.title}</h3>

            <p className="text-gray-300 mt-2">🎶 {e.artist}</p>
            <p>📍 {e.venueName}</p>
            <p>📅 {e.date} ⏰ {e.time}</p>

            <p className="text-pink-500 font-bold mt-2">
              Rp {Number(e.price).toLocaleString()}
            </p>

            <p className="text-gray-400 text-sm mt-2">
              {e.description}
            </p>

            {isAdminOrOrganizer() && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(e)}
                  className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
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
              {editMode ? "Edit Event" : "Buat Event"}
            </h2>

            <input
              placeholder="Judul Event"
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />

            <input
              type="date"
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
            />

            <input
              type="time"
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.time}
              onChange={(e) => setForm({...form, time: e.target.value})}
            />

            <select
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.venueId}
              onChange={(e) => setForm({...form, venueId: e.target.value})}
            >
              <option value="">Pilih Venue</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Artist"
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.artist}
              onChange={(e) => setForm({...form, artist: e.target.value})}
            />

            <input
              placeholder="Harga mulai"
              type="number"
              className="w-full mb-2 p-2 bg-gray-800"
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
            />

            <textarea
              placeholder="Deskripsi"
              className="w-full mb-3 p-2 bg-gray-800"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={handleSave}
                className="bg-pink-500 px-4 py-2 rounded"
              >
                {editMode ? "Simpan" : "Buat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventPage;