import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEventById, createEvent, updateEvent } from "../services/eventService";
import { getVenues } from "../services/venueService";
import { useAuth } from "../../../context/AuthContext";

function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    venueId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVenues().then(setVenues);
    if (id) {
      getEventById(id).then((event) => {
        if (event) {
          setForm({
            title: event.title || event.name || "",
            date: event.date || "",
            time: event.time || "",
            venueId: event.venueId || "",
          });
        }
      });
    }
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        venueId: form.venueId,
        organizerId: user?.organizer_id,
        date: form.date,
        time: form.time,
      };
      if (id) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate("/events");
    } catch (err) {
      setError(err.message || "Gagal menyimpan event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>{id ? "Edit Event" : "Buat Event"}</h1>

      {error && (
        <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Judul Event"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          required
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          required
        />

        <input
          type="time"
          value={form.time}
          onChange={(e) => handleChange("time", e.target.value)}
        />

        <select
          value={form.venueId}
          onChange={(e) => handleChange("venueId", e.target.value)}
          required
        >
          <option value="">Pilih Venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate("/events")}>
            Batal
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventFormPage;
