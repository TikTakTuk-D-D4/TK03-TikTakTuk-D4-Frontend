import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getVenueById, createVenue, updateVenue } from "../services/venueService";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      getVenueById(id).then((venue) => {
        if (venue) setForm(venue);
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
        name: form.name,
        city: form.city,
        address: form.address,
        capacity: Number(form.capacity) || 0,
        seatingType: form.seatingType,
      };
      if (id) {
        await updateVenue(id, payload);
      } else {
        await createVenue(payload);
      }
      navigate("/venues");
    } catch (err) {
      setError(err.message || "Gagal menyimpan venue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-2xl mx-auto bg-[#1a1a1a] p-8 rounded-2xl border border-[#2a2a2a] shadow-lg">
        <h1 className="text-3xl font-bold mb-8 text-pink-400">
          {id ? "Edit Venue" : "Tambah Venue"}
        </h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-900/30 border border-red-700 px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            className="input"
            placeholder="Nama"
            value={form.name}
            maxLength={50}
            onChange={(e) => handleChange("name", e.target.value)}
            required
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
            maxLength={200}
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
            <button type="submit" className="btn-save" style={{ flex: 2 }} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
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
        .btn-save:hover { background: #db2777; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

export default VenueFormPage;
