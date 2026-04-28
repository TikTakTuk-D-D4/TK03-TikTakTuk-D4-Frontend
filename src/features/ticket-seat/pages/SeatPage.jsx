import { useRef, useState, useSyncExternalStore } from "react";
import { getCurrentUser } from "../../auth/services/authService";
import {
  AccessDenied,
  EmptyState,
  Modal,
  PageHeader,
  StatCards,
  ToastStack,
} from "../components/TicketSeatShared";
import {
  canAccessSeatManagement,
  createSeat,
  deleteSeat,
  getManagedVenuesForUser,
  getSeatViewModel,
  getTicketSeatSnapshot,
  getVisibleSeatsForUser,
  subscribeTicketSeatStore,
  updateSeat,
} from "../services/ticketSeatStore";

const initialForm = {
  venue_id: "",
  section: "",
  row_number: "",
  seat_number: "",
};

function sortSeatView(a, b) {
  return (
    a.venue.name.localeCompare(b.venue.name) ||
    a.section.localeCompare(b.section) ||
    a.row_number.localeCompare(b.row_number) ||
    a.seat_number.localeCompare(b.seat_number, undefined, { numeric: true })
  );
}

function SeatPage() {
  useSyncExternalStore(subscribeTicketSeatStore, getTicketSeatSnapshot);

  const user = getCurrentUser();
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("all");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [modalState, setModalState] = useState({ type: "", seatId: "" });
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = useRef(0);

  const pushToast = (message, type = "success") => {
    toastCounterRef.current += 1;
    const id = `seat-toast-${toastCounterRef.current}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2800);
  };

  if (!canAccessSeatManagement(user?.role)) {
    return (
      <AccessDenied
        title="Manajemen Kursi hanya untuk Admin dan Organizer."
        description="Customer tidak dapat mengakses halaman ini. Gunakan menu tiket untuk melihat kepemilikan tiket."
      />
    );
  }

  const managedVenues = getManagedVenuesForUser(user);
  const visibleSeats = getVisibleSeatsForUser(user).map(getSeatViewModel).sort(sortSeatView);
  const reservedVenues = managedVenues.filter((venue) => venue.seating_type === "reserved");

  const filteredSeats = visibleSeats.filter((seat) => {
    const matchesVenue = venueFilter === "all" || seat.venue_id === venueFilter;
    const matchesSearch =
      !search ||
      [
        seat.seat_id,
        seat.section,
        seat.row_number,
        seat.seat_number,
        seat.venue.name,
        seat.seatLabel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesVenue && matchesSearch;
  });

  const venueForMap =
    venueFilter !== "all"
      ? reservedVenues.find((venue) => venue.venue_id === venueFilter) || reservedVenues[0] || null
      : reservedVenues[0] || null;

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
  const seatLinkedToTicket = seatBeingEdited?.ticket;

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
      sub: "Venue reserved/free milik role ini",
    },
  ];

  const openCreateModal = () => {
    setForm({
      ...initialForm,
      venue_id: venueForMap?.venue_id || managedVenues[0]?.venue_id || "",
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const payload = {
      venue_id: form.venue_id,
      section: form.section,
      row_number: form.row_number,
      seat_number: form.seat_number,
    };

    const result =
      modalState.type === "edit"
        ? updateSeat(modalState.seatId, payload)
        : createSeat(payload);

    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }

    pushToast(
      modalState.type === "edit"
        ? "Kursi berhasil diperbarui."
        : "Kursi baru berhasil ditambahkan.",
    );
    closeModal();
  };

  const handleDeleteSeat = () => {
    const result = deleteSeat(modalState.seatId);

    if (!result.ok) {
      pushToast(result.error || "Gagal menghapus kursi.", "error");
      return;
    }

    pushToast(
      result.detachedTicketIds.length
        ? "Kursi dihapus dan relasi ke tiket ikut dilepas."
        : "Kursi berhasil dihapus.",
    );
    if (selectedSeatId === modalState.seatId) {
      setSelectedSeatId("");
    }
    closeModal();
  };

  return (
    <>
      <div className="page ticket-seat-page">
        <PageHeader
          title="Manajemen Kursi"
          subtitle="Kelola kursi venue untuk reserved seating."
          action={
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>
              + Tambah Kursi
            </button>
          }
        />

        <StatCards items={stats} />

        <section className="surface pad filter-panel">
          <div className="filter-grid">
            <label>
              Venue
              <select value={venueFilter} onChange={(event) => setVenueFilter(event.target.value)}>
                <option value="all">Semua Venue</option>
                {managedVenues.map((venue) => (
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
                  : "Belum ada venue reserved seating untuk ditampilkan."}
              </p>
            </div>
            {selectedSeat ? <span className="badge">{selectedSeat.seatLabel}</span> : null}
          </div>

          {venueForMap ? (
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
                <span className="item">
                  <span className="dot taken" />
                  Disabled
                </span>
              </div>
              <div className="seat-map-shell" style={{ "--seat-map-width": `${seatMapWidth}px` }}>
                <div className="stage">STAGE</div>
              {seatMapRows.length ? (
                seatMapRows.map((row) => (
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
                        const className = isAssigned ? "seat selected" : isSelected ? "seat selected" : "seat free";

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
                ))
              ) : (
                <p className="helper-text">Tidak ada kursi yang cocok dengan filter saat ini.</p>
              )}
              </div>
            </div>
          ) : (
            <EmptyState
              title="Belum ada venue reserved seating."
              description="Tambah seat pada venue reserved atau pilih venue lain."
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeats.map((seat) => (
                    <tr key={seat.seat_id}>
                      <td className="mono">{seat.seat_id}</td>
                      <td>{seat.venue.name}</td>
                      <td>{seat.section}</td>
                      <td>{seat.row_number}</td>
                      <td>{seat.seat_number}</td>
                      <td>
                        <span className={`chip dot ${seat.status === "Terpakai" ? "used" : "active"}`}>
                          {seat.status}
                        </span>
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada data kursi yang tampil."
              description="Ubah filter atau tambahkan kursi baru untuk venue yang dikelola."
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
              {managedVenues.map((venue) => (
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
              <strong>{seatBeingEdited.venue.name}</strong>.
            </p>
            {seatLinkedToTicket ? (
              <div className="warning-box">
                Kursi sedang terhubung ke tiket. Menghapus kursi akan melepas relasi kursi dari tiket.
              </div>
            ) : (
              <p className="helper-text">Kursi belum terhubung ke tiket apa pun.</p>
            )}
          </div>
        ) : null}
      </Modal>

      <ToastStack items={toasts} />
    </>
  );
}

export default SeatPage;
