import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  AccessDenied,
  EmptyState,
  Modal,
  PageHeader,
  StatCards,
  ToastStack,
} from "../components/TicketSeatShared";
import { getSeats, createSeat, updateSeat, deleteSeat } from "../services/seatService";
import { getVenues } from "../../venue-event/services/venueService";

const initialForm = {
  venue_id: "",
  section: "",
  row_number: "",
  seat_number: "",
};

function sortSeatView(a, b) {
  return (
    (a.venue?.name || "").localeCompare(b.venue?.name || "") ||
    a.section.localeCompare(b.section) ||
    a.row_number.localeCompare(b.row_number) ||
    a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })
  );
}

function SeatPage() {
  const { user } = useAuth();
  const [seats, setSeats] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [modalState, setModalState] = useState({ type: "", seatId: "" });
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = useRef(0);

  const canManage = user?.role === "administrator" || user?.role === "organizer";

  useEffect(() => {
    Promise.all([getSeats(), getVenues()])
      .then(([seatsData, venuesData]) => {
        setSeats(seatsData);
        setVenues(venuesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => getSeats().then(setSeats);

  const pushToast = (message, type = "success") => {
    toastCounterRef.current += 1;
    const id = `seat-toast-${toastCounterRef.current}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2800);
  };

  const visibleSeats = seats.slice().sort(sortSeatView);

  const filteredSeats = visibleSeats.filter((seat) => {
    const matchesVenue = venueFilter === "all" || seat.venue_id === venueFilter;
    const matchesSearch =
      !search ||
      [
        seat.seat_id,
        seat.section,
        seat.row_number,
        seat.seat_number,
        seat.venue?.name,
        seat.seatLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesVenue && matchesSearch;
  });

  const venueForMap =
    venueFilter !== "all"
      ? venues.find((v) => v.venue_id === venueFilter) || null
      : null;

  const groupedSeats = venueForMap
    ? filteredSeats
        .filter((seat) => seat.venue_id === venueForMap.venue_id)
        .reduce((rows, seat) => {
          const key = seat.row_number;
          rows[key] = [...(rows[key] || []), seat];
          return rows;
        }, {})
    : {};

  const seatMapRows = Object.entries(groupedSeats)
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
    .map(([rowId, seatsInRow]) => ({
      rowId,
      seats: seatsInRow.sort((a, b) =>
        a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true }),
      ),
    }));
  const maxSeatCount = Math.max(...seatMapRows.map((row) => row.seats.length), 0);
  const seatMapWidth = Math.max(320, maxSeatCount * 56);

  const selectedSeat = visibleSeats.find((seat) => seat.seat_id === selectedSeatId) || null;
  const seatBeingEdited = visibleSeats.find((seat) => seat.seat_id === modalState.seatId) || null;

  const stats = [
    { label: "Total Kursi", value: filteredSeats.length, sub: "Sesuai filter aktif" },
    {
      label: "Kursi Tersedia",
      value: filteredSeats.filter((seat) => seat.status === "Tersedia").length,
      sub: "Belum dipakai ticket",
    },
    {
      label: "Kursi Terpakai",
      value: filteredSeats.filter((seat) => seat.status === "Terpakai").length,
      sub: "Sedang terhubung ke ticket",
    },
    {
      label: "Venue Aktif",
      value: new Set(filteredSeats.map((seat) => seat.venue_id)).size,
      sub: "Venue dari kursi tersaring",
    },
  ];

  const openCreateModal = () => {
    setForm({
      ...initialForm,
      venue_id: venueForMap?.venue_id || venues[0]?.venue_id || "",
    });
    setErrors({});
    setModalState({ type: "create", seatId: "" });
  };

  const openEditModal = (seat) => {
    setForm({
      venue_id: seat.venue_id,
      section: seat.section,
      row_number: seat.row_number,
      seat_number: seat.seat_number,
    });
    setErrors({});
    setModalState({ type: "edit", seatId: seat.seat_id });
  };

  const openDeleteModal = (seat) => {
    setErrors({});
    setModalState({ type: "delete", seatId: seat.seat_id });
  };

  const closeModal = () => {
    setModalState({ type: "", seatId: "" });
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.venue_id) nextErrors.venue_id = "Venue wajib dipilih.";
    if (!form.section.trim()) nextErrors.section = "Section wajib diisi.";
    if (!form.row_number.trim()) nextErrors.row_number = "Baris wajib diisi.";
    if (!form.seat_number.trim()) nextErrors.seat_number = "Nomor kursi wajib diisi.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      venue_id: form.venue_id,
      section: form.section,
      row_number: form.row_number.toUpperCase(),
      seat_number: form.seat_number,
    };

    try {
      if (modalState.type === "edit") {
        await updateSeat(modalState.seatId, payload);
        pushToast("Kursi berhasil diperbarui.");
      } else {
        await createSeat(payload);
        pushToast("Kursi baru berhasil ditambahkan.");
      }
      await refresh();
      closeModal();
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const handleDeleteSeat = async () => {
    try {
      await deleteSeat(modalState.seatId);
      if (selectedSeatId === modalState.seatId) setSelectedSeatId("");
      await refresh();
      pushToast("Kursi berhasil dihapus.");
      closeModal();
    } catch (err) {
      pushToast(err.message || "Gagal menghapus kursi.", "error");
    }
  };

  if (loading) {
    return (
      <div className="page ticket-seat-page">
        <p>Memuat data kursi...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page ticket-seat-page">
        <PageHeader
          title={canManage ? "Manajemen Kursi" : "Daftar Kursi"}
          subtitle={canManage ? "Kelola kursi venue untuk reserved seating." : "Lihat denah dan daftar kursi yang tersedia."}
          action={
            canManage ? (
              <button className="btn btn-primary" type="button" onClick={openCreateModal}>
                + Tambah Kursi
              </button>
            ) : null
          }
        />

        <StatCards items={stats} />

        <section className="surface pad filter-panel">
          <div className="filter-grid">
            <label>
              Venue
              <select value={venueFilter} onChange={(event) => setVenueFilter(event.target.value)}>
                <option value="all">Semua Venue</option>
                {venues.map((venue) => (
                  <option key={venue.venue_id} value={venue.venue_id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-grow">
              Cari section / baris / kursi
              <input
                type="text"
                placeholder="Cari section, baris, atau nomor kursi..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="surface pad">
          <div className="section-head">
            <div>
              <h3>Seat Map</h3>
              <p>
                {venueForMap
                  ? `${venueForMap.name} - klik kursi untuk melihat detail.`
                  : "Pilih venue spesifik dari filter untuk melihat denah kursi."}
              </p>
            </div>
            {selectedSeat ? <span className="badge">{selectedSeat.seatLabel}</span> : null}
          </div>

          {venueForMap && seatMapRows.length > 0 ? (
            <div className="seat-wrap">
              <div className="legend">
                <span className="item">
                  <span className="dot free" />
                  Available
                </span>
                <span className="item">
                  <span className="dot sel" />
                  Assigned/Taken
                </span>
              </div>
              <div className="seat-map-shell" style={{ "--seat-map-width": `${seatMapWidth}px` }}>
                <div className="stage">STAGE</div>
                {seatMapRows.map((row) => (
                  <div className="seat-row" key={row.rowId}>
                    <span className="row-id">{row.rowId}</span>
                    <div
                      className="seat-grid"
                      style={{
                        gridTemplateColumns: `repeat(${row.seats.length}, minmax(44px, 44px))`,
                      }}
                    >
                      {row.seats.map((seat) => {
                        const isAssigned = seat.status === "Terpakai";
                        const isSelected = selectedSeatId === seat.seat_id;
                        const className = isAssigned || isSelected ? "seat selected" : "seat free";
                        return (
                          <button
                            key={seat.seat_id}
                            className={className}
                            type="button"
                            title={`${seat.seatLabel} - ${seat.status}`}
                            onClick={() => setSelectedSeatId(seat.seat_id)}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState
              title={venueForMap ? "Tidak ada kursi untuk venue ini." : "Pilih venue dari filter untuk melihat denah."}
              description="Tambah kursi baru atau pilih venue yang sudah memiliki kursi."
            />
          )}
        </section>

        <section className="surface pad">
          <div className="section-head">
            <div>
              <h3>Daftar Kursi</h3>
              <p>Status kursi diturunkan dari relasi dengan ticket.</p>
            </div>
          </div>

          {filteredSeats.length ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Seat ID</th>
                    <th>Venue</th>
                    <th>Section</th>
                    <th>Row</th>
                    <th>Seat Number</th>
                    <th>Status</th>
                    {canManage ? <th>Actions</th> : <th />}
                  </tr>
                </thead>
                <tbody>
                  {filteredSeats.map((seat) => (
                    <tr key={seat.seat_id}>
                      <td className="mono">{seat.seat_id}</td>
                      <td>{seat.venue?.name || "-"}</td>
                      <td>{seat.section}</td>
                      <td>{seat.row_number}</td>
                      <td>{seat.seat_number}</td>
                      <td>
                        <span className={`chip dot ${seat.status === "Terpakai" ? "used" : "active"}`}>
                          {seat.status}
                        </span>
                      </td>
                      {canManage ? (
                        <td>
                          <div className="action-row">
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEditModal(seat)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" type="button" onClick={() => openDeleteModal(seat)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : <td>-</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data kursi yang tampil."
              description="Ubah filter atau tambahkan kursi baru."
            />
          )}
        </section>
      </div>

      <Modal
        open={modalState.type === "create" || modalState.type === "edit"}
        title={modalState.type === "edit" ? "Edit Kursi" : "Tambah Kursi Baru"}
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>
              Batal
            </button>
            <button className="btn btn-primary" type="submit" form="seat-form">
              {modalState.type === "edit" ? "Simpan" : "Tambah"}
            </button>
          </>
        }
      >
        <form className="form-section" id="seat-form" onSubmit={handleSubmit}>
          <label>
            Venue
            <select
              value={form.venue_id}
              onChange={(event) => setForm((current) => ({ ...current, venue_id: event.target.value }))}
            >
              <option value="">Pilih venue</option>
              {venues.map((venue) => (
                <option key={venue.venue_id} value={venue.venue_id}>
                  {venue.name}
                </option>
              ))}
            </select>
            {errors.venue_id ? <span className="form-error">{errors.venue_id}</span> : null}
          </label>

          <label>
            Section
            <input
              type="text"
              placeholder="Contoh: WVIP / VIP / Tribune West"
              value={form.section}
              onChange={(event) => setForm((current) => ({ ...current, section: event.target.value }))}
            />
            {errors.section ? <span className="form-error">{errors.section}</span> : null}
          </label>

          <div className="form-row-2">
            <label>
              Baris
              <input
                type="text"
                placeholder="Contoh: A / B / 1"
                value={form.row_number}
                onChange={(event) =>
                  setForm((current) => ({ ...current, row_number: event.target.value.toUpperCase() }))
                }
              />
              {errors.row_number ? <span className="form-error">{errors.row_number}</span> : null}
            </label>

            <label>
              No. Kursi
              <input
                type="text"
                placeholder="Contoh: 1 / 2 / 3"
                value={form.seat_number}
                onChange={(event) => setForm((current) => ({ ...current, seat_number: event.target.value }))}
              />
              {errors.seat_number ? <span className="form-error">{errors.seat_number}</span> : null}
            </label>
          </div>

          {errors.form ? <span className="form-error">{errors.form}</span> : null}
        </form>
      </Modal>

      <Modal
        open={modalState.type === "delete"}
        title="Hapus Kursi"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>
              Batal
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteSeat}>
              Hapus
            </button>
          </>
        }
      >
        {seatBeingEdited ? (
          <div className="form-section">
            <p>
              Anda akan menghapus kursi <strong>{seatBeingEdited.seatLabel}</strong> dari venue{" "}
              <strong>{seatBeingEdited.venue?.name}</strong>.
            </p>
            <p className="helper-text">Relasi kursi ke tiket akan ikut dilepas.</p>
          </div>
        ) : null}
      </Modal>

      <ToastStack items={toasts} />
    </>
  );
}

export default SeatPage;
