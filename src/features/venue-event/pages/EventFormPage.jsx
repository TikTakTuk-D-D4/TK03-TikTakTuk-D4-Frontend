import { useEffect, useState } from "react";
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
    ticketCategory: "Regular",
    stock: "",
    price: "",
  });

  useEffect(() => {
    const venueData = getVenues();
    setVenues(venueData);

    if (id) {
      const events = getEvents();
      const selectedEvent = events.find((event) => event.id === Number(id));

      if (selectedEvent) {
        setForm(selectedEvent);
      }
    }
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const events = getEvents();
    const selectedVenue = venues.find(
      (venue) => venue.id === Number(form.venueId)
    );

    const newEvent = {
      ...form,
      id: id ? Number(id) : Date.now(),
      venueId: Number(form.venueId),
      venueName: selectedVenue?.name || "",
      price: Number(form.price) || 0,
    };

    const updatedEvents = id
      ? events.map((event) =>
          event.id === Number(id) ? newEvent : event
        )
      : [...events, newEvent];

    saveEvents(updatedEvents);
    navigate("/events");
  };

  return (
    <div className="page">
      <h1>{id ? "Edit Event" : "Buat Event"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Judul"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />

        <input
          type="time"
          value={form.time}
          onChange={(e) => handleChange("time", e.target.value)}
        />

        <select
          value={form.venueId}
          onChange={(e) => handleChange("venueId", e.target.value)}
        >
          <option value="">Pilih Venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>

        <select
        value={form.ticketCategory}
        onChange={(e) =>
          setForm({ ...form, ticketCategory: e.target.value })
        }
      >
        <option value="VIP">VIP</option>
        <option value="Gold">Gold</option>
        <option value="Regular">Regular</option>
      </select>

      <input
        type="number"
        placeholder="Stock tiket"
        value={form.stock}
        onChange={(e) =>
          setForm({ ...form, stock: e.target.value })
        }
      />

        <input
          placeholder="Artist"
          value={form.artist}
          onChange={(e) => handleChange("artist", e.target.value)}
        />

        <input
          type="number"
          placeholder="Harga"
          value={form.price}
          onChange={(e) =>
            handleChange("price", e.target.value.replace(/\D/g, ""))
          }
        />

        <textarea
          placeholder="Deskripsi"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />

        <button type="submit">Simpan</button>
      </form>
    </div>
  );
}

export default EventFormPage;