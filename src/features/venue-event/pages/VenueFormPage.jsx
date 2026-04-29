import { useEffect, useState } from "react";
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
      const selectedVenue = venues.find(
        (venue) => venue.id === Number(id)
      );

      if (selectedVenue) {
        setForm(selectedVenue);
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

    const venues = getVenues();

    const newVenue = {
      ...form,
      id: id ? Number(id) : Date.now(),
      capacity: Number(form.capacity) || 0,
    };

    const updatedVenues = id
      ? venues.map((venue) =>
          venue.id === Number(id) ? newVenue : venue
        )
      : [...venues, newVenue];

    saveVenues(updatedVenues);
    navigate("/venues");
  };

  return (
    <div className="page">
      <h1>{id ? "Edit Venue" : "Tambah Venue"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          placeholder="Nama"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <input
          placeholder="Kota"
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />

        <input
          placeholder="Alamat"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />

        <input
          type="number"
          placeholder="Capacity"
          value={form.capacity}
          onChange={(e) => handleChange("capacity", e.target.value)}
        />

        <select
          value={form.seatingType}
          onChange={(e) => handleChange("seatingType", e.target.value)}
        >
          <option value="free">Free</option>
          <option value="reserved">Reserved</option>
        </select>

        <button type="submit">Simpan</button>
      </form>
    </div>
  );
}

export default VenueFormPage;