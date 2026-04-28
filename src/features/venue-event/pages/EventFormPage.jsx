import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvents, saveEvents } from "../services/eventService";
import { getVenues } from "../services/venueService";

function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [venues, setVenues] = useState([]);

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
    setVenues(getVenues());

    if (id) {
      const events = getEvents();
      const found = events.find((e) => e.id == id);
      if (found) setForm(found);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const events = getEvents();
    const venue = venues.find((v) => v.id == form.venueId);

    const newEvent = {
      ...form,
      id: id ? Number(id) : Date.now(),
      venueName: venue?.name || "",
      price: Number(form.price) || 0, // 🔥 FIX NaN
    };

    let updated;

    if (id) {
      updated = events.map((e) => (e.id == id ? newEvent : e));
    } else {
      updated = [...events, newEvent];
    }

    saveEvents(updated);

    navigate("/events"); // 🔥 balik ke list
  };

  return (
    <div className="page">
      <h1>{id ? "Edit Event" : "Buat Event"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <input
          placeholder="Judul"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <input
          type="time"
          value={form.time}
          onChange={(e) =>
            setForm({ ...form, time: e.target.value })
          }
        />

        <select
          value={form.venueId}
          onChange={(e) =>
            setForm({ ...form, venueId: e.target.value })
          }
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
          value={form.artist}
          onChange={(e) =>
            setForm({ ...form, artist: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Harga"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value.replace(/\D/g, ""),
            })
          }
        />

        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button type="submit">
          Simpan
        </button>
      </form>
    </div>
  );
}

export default EventFormPage;