import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenues, saveVenues } from "../services/venueService";

function VenueFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    capacity: "",
    seatingType: "free",
  });

  useEffect(() => {
    if (id) {
      const venues = getVenues();
      const found = venues.find((v) => v.id == id);
      if (found) setForm(found);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const venues = getVenues();

    const newVenue = {
      ...form,
      id: id ? Number(id) : Date.now(),
      capacity: Number(form.capacity) || 0, // 🔥 FIX AMAN
    };

    let updated;

    if (id) {
      updated = venues.map((v) =>
        v.id == id ? newVenue : v
      );
    } else {
      updated = [...venues, newVenue];
    }

    saveVenues(updated);

    navigate("/venues");
  };

  return (
    <div className="page">
      <h1>{id ? "Edit Venue" : "Tambah Venue"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">

        <input
          placeholder="Nama"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <input
          placeholder="Kota"
          value={form.city}
          onChange={(e) =>
            setForm({ ...form, city: e.target.value })
          }
        />

        <input
          placeholder="Alamat"
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />

        <input
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) =>
            setForm({ ...form, capacity: e.target.value })
          }
        />

        <select
          value={form.seatingType}
          onChange={(e) =>
            setForm({ ...form, seatingType: e.target.value })
          }
        >
          <option value="free">Free</option>
          <option value="reserved">Reserved</option>
        </select>

        <button type="submit">
          Simpan
        </button>
      </form>
    </div>
  );
}

export default VenueFormPage;