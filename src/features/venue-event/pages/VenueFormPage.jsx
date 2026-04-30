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
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-pink-400">
          {id ? "Edit Venue" : "Tambah Venue"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            className="input"
            placeholder="Nama"
            value={form.name}
            maxLength={50}
            onChange={(e) => handleChange("name", e.target.value)}
          />

          <input
            className="input"
            placeholder="Kota"
            value={form.city}
            maxLength={50}
            onChange={(e) => handleChange("city", e.target.value)}
          />

          <input
            className="input"
            placeholder="Alamat"
            value={form.address}
            maxLength={50}
            onChange={(e) => handleChange("address", e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => handleChange("capacity", e.target.value)}
          />

          <select
            className="input"
            value={form.seatingType}
            onChange={(e) => handleChange("seatingType", e.target.value)}
          >
            <option value="free">Free</option>
            <option value="reserved">Reserved</option>
          </select>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              className="btn-save"
              style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#aaa", flex: 1 }}
              onClick={() => navigate("/venues")}
            >
              Batal
            </button>
            <button type="submit" className="btn-save" style={{ flex: 2 }}>
              Simpan
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 12px;
          background: #1f1f1f;
          border: 1px solid #2a2a2a;
          color: white;
          font-size: 15px;
          outline: none;
        }

        .input:focus {
          border-color: #ec4899;
          box-shadow: 0 0 0 2px rgba(236,72,153,0.2);
        }

        .btn-save {
          padding: 14px;
          border-radius: 12px;
          background: #ec4899;
          font-weight: bold;
          font-size: 16px;
          transition: 0.2s;
        }

        .btn-save:hover {
          background: #db2777;
        }
      `}</style>
    </div>
  );
}

export default VenueFormPage;