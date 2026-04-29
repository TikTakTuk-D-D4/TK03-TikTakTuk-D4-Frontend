import { useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { getPageUser } from "../../auth/services/authService";
import {
  AccessDenied,
  EmptyState,
  Modal,
  PageHeader,
  StatCards,
  ToastStack,
} from "../components/TicketSeatShared";
import {
  canAccessTicketManagement,
  deleteTicket,
  getAvailableSeatsByVenue,
  getManagedEventsForUser,
  getManagedVenuesForUser,
  getTicketSeatSnapshot,
  getTicketViewModel,
  getVisibleTicketsForUser,
  issueTicket,
  subscribeTicketSeatStore,
  updateTicket,
} from "../services/ticketSeatStore";

const initialIssueForm = {
  customer_id: "",
  order_id: "",
  category_id: "",
  seat_id: "",
  status: "active",
};

const initialEditForm = {
  status: "active",
  seat_id: "",
};

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ticketSort(a, b) {
  return new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime();
}

function getStatusLabel(status) {
  switch (status) {
    case "active":
      return "Scan Entry";
    case "pending":
      return "Pending Check";
    case "used":
      return "Used";
    case "cancelled":
      return "Void";
    default:
      return "E-Ticket";
  }
}

function TicketPage() {
  const snapshot = useSyncExternalStore(subscribeTicketSeatStore, getTicketSeatSnapshot);
  const location = useLocation();
  const user = getPageUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalState, setModalState] = useState({ type: "", ticketId: "" });
  const [issueForm, setIssueForm] = useState(initialIssueForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [errors, setErrors] = useState({});
  const [toasts, setToasts] = useState([]);
  const toastCounterRef = useRef(0);

  const pushToast = (message, type = "success") => {
    toastCounterRef.current += 1;
    const id = `ticket-toast-${toastCounterRef.current}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2800);
  };

  const isManagementPath = location.pathname === "/manage-tickets";
  const isMyTicketsPath = location.pathname === "/my-tickets";
  const adminCanMutate = user?.role === "admin";

  if (isManagementPath && !canAccessTicketManagement(user?.role)) {
    return (
      <AccessDenied
        title="Manajemen Tiket hanya untuk Admin dan Organizer."
        description="Customer tidak dapat mengakses halaman issue dan pengelolaan tiket."
      />
    );
  }

  if (isMyTicketsPath && user?.role !== "customer") {
    return (
      <AccessDenied
        title="Halaman Tiket Saya hanya untuk Customer."
        description="Gunakan Manajemen Tiket untuk melihat dan mengelola tiket lintas customer."
      />
    );
  }

  const isManagementView = canAccessTicketManagement(user?.role);
  const visibleTickets = getVisibleTicketsForUser(user).map(getTicketViewModel).sort(ticketSort);
  const managedEvents = getManagedEventsForUser(user);
  const managedEventIds = new Set(managedEvents.map((eventItem) => eventItem.event_id));
  const managedCategories = snapshot.ticketCategories.filter((category) =>
    managedEventIds.has(category.event_id),
  );
  const managedVenues = getManagedVenuesForUser(user);
  const allCustomers = snapshot.customers;

  const filteredTickets = visibleTickets.filter((ticket) => {
    const matchesSearch =
      !search ||
      [
        ticket.ticket_code,
        ticket.customer?.full_name,
        ticket.event?.title,
        ticket.venue?.name,
        ticket.category?.category_name,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesEvent = eventFilter === "all" || ticket.event?.event_id === eventFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category?.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesEvent && matchesCategory;
  });

  const summaryItems = [
    { label: "Total Tiket", value: filteredTickets.length, sub: "Sesuai filter aktif" },
    {
      label: "Active",
      value: filteredTickets.filter((ticket) => ticket.status === "active").length,
      sub: "Tiket siap digunakan",
    },
    {
      label: "Pending",
      value: filteredTickets.filter((ticket) => ticket.status === "pending").length,
      sub: "Menunggu konfirmasi",
    },
    {
      label: "Used/Cancelled",
      value: filteredTickets.filter((ticket) => ticket.status === "used" || ticket.status === "cancelled").length,
      sub: "Sudah dipakai atau dibatalkan",
    },
  ];

  const ticketBeingEdited =
    visibleTickets.find((ticket) => ticket.ticket_id === modalState.ticketId) || null;

  const issueCategory = managedCategories.find(
    (category) => category.category_id === issueForm.category_id,
  );
  const issueEvent = issueCategory
    ? managedEvents.find((eventItem) => eventItem.event_id === issueCategory.event_id)
    : null;
  const issueVenue = issueEvent
    ? managedVenues.find((venue) => venue.venue_id === issueEvent.venue_id)
    : null;
  const issueSeatOptions =
    issueVenue?.seating_type === "reserved"
      ? getAvailableSeatsByVenue(issueVenue.venue_id)
      : [];

  const editSeatOptions =
    ticketBeingEdited && ticketBeingEdited.venue?.seating_type === "reserved"
      ? getAvailableSeatsByVenue(ticketBeingEdited.venue.venue_id, ticketBeingEdited.ticket_id)
      : [];

  const availableOrders = snapshot.orders.filter((order) => {
    if (!issueForm.customer_id) return false;
    if (order.customer_id !== issueForm.customer_id) return false;
    if (issueEvent && order.event_id !== issueEvent.event_id) return false;
    return true;
  });

  const openIssueModal = () => {
    setIssueForm({
      ...initialIssueForm,
      customer_id: allCustomers[0]?.customer_id || "",
    });
    setErrors({});
    setModalState({ type: "issue", ticketId: "" });
  };

  const openEditModal = (ticket) => {
    setEditForm({
      status: ticket.status,
      seat_id: ticket.seat?.seat_id || "",
    });
    setErrors({});
    setModalState({ type: "edit", ticketId: ticket.ticket_id });
  };

  const openDeleteModal = (ticket) => {
    setErrors({});
    setModalState({ type: "delete", ticketId: ticket.ticket_id });
  };

  const closeModal = () => {
    setModalState({ type: "", ticketId: "" });
    setErrors({});
  };

  const handleIssueSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!issueForm.customer_id) nextErrors.customer_id = "Customer wajib dipilih.";
    if (!issueForm.category_id) nextErrors.category_id = "Kategori tiket wajib dipilih.";

    if (issueVenue?.seating_type === "reserved" && issueForm.seat_id && !issueSeatOptions.some((seat) => seat.seat_id === issueForm.seat_id)) {
      nextErrors.seat_id = "Kursi yang dipilih sudah tidak tersedia.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = issueTicket(issueForm);

    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }

    pushToast("Tiket baru berhasil di-issue.");
    closeModal();
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();

    const result = updateTicket(modalState.ticketId, editForm);

    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }

    pushToast("Tiket berhasil diperbarui.");
    closeModal();
  };

  const handleDeleteTicket = () => {
    const result = deleteTicket(modalState.ticketId);

    if (!result.ok) {
      pushToast(result.error || "Gagal menghapus tiket.", "error");
      return;
    }

    pushToast("Tiket berhasil dihapus dan relasi kursi ikut dilepas.");
    closeModal();
  };

  return (
    <>
      <div className="page ticket-seat-page">
        <PageHeader
          title={isManagementView ? "Manajemen Tiket" : "Tiket Saya"}
          subtitle={
            isManagementView
              ? "Issue dan kelola tiket customer."
              : "Lihat tiket milik Anda beserta status dan kursinya."
          }
          action={
            isManagementView ? (
              <button className="btn btn-primary" type="button" onClick={openIssueModal}>
                Issue Tiket
              </button>
            ) : null
          }
        />

        <StatCards items={summaryItems} />

        <section className="surface pad filter-panel">
          <div className="filter-grid ticket-filter-grid">
            <label className="filter-grow">
              Cari ticket code / customer / event
              <input
                type="text"
                placeholder="Cari kode tiket, customer, atau event..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="used">Used</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>

            <label>
              Event
              <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)}>
                <option value="all">Semua Event</option>
                {[...new Map(visibleTickets.map((ticket) => [ticket.event?.event_id, ticket.event])).values()]
                  .filter(Boolean)
                  .map((eventItem) => (
                    <option key={eventItem.event_id} value={eventItem.event_id}>
                      {eventItem.title}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Category
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">Semua Category</option>
                {[...new Map(visibleTickets.map((ticket) => [ticket.category?.category_id, ticket.category])).values()]
                  .filter(Boolean)
                  .map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.category_name}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        </section>

        {filteredTickets.length ? (
          <section className="ticket-list">
            {filteredTickets.map((ticket) => (
              <article className="ticket-card" key={ticket.ticket_id}>
                <div className="ticket-stub">
                  <div className="stub-text">TIK TAK TUK</div>
                  <div className="stub-serial">{ticket.ticket_code}</div>
                </div>

                <div className="ticket-body">
                  <div className="ticket-top">
                    <div>
                      <div className="cat">{ticket.category?.category_name || "-"}</div>
                      <h4>{ticket.event?.title || "Event belum tersedia"}</h4>
                    </div>
                    {isManagementView ? (
                      <div className="ticket-side-note" aria-hidden="true">
                        <span className="ticket-side-kicker">E-Ticket</span>
                        <strong>{ticket.customer?.full_name?.split(" ")[0] || "Guest"}</strong>
                        <span className="ticket-side-sub">{ticket.seat ? "Reserved Seat" : "Free Seating"}</span>
                      </div>
                    ) : (
                      <div className="ticket-scan-box" aria-hidden="true">
                        <span className="ticket-scan-kicker">{getStatusLabel(ticket.status)}</span>
                        <span className="ticket-scan-code mono">
                          {ticket.ticket_code.slice(-4)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ticket-meta">
                    <span>
                      <strong>Pelanggan:</strong> {ticket.customer?.full_name || "-"}
                    </span>
                    <span>
                      <strong>Venue:</strong> {ticket.venue?.name || "-"}
                    </span>
                    <span>
                      <strong>Jadwal:</strong> {formatDateTime(ticket.event?.event_datetime)}
                    </span>
                    <span>
                      <strong>Seat:</strong> {ticket.seatLabel}
                    </span>
                    <span>
                      <strong>Order:</strong> <span className="mono">{ticket.order?.order_id || "-"}</span>
                    </span>
                    <span>
                      <strong>Harga:</strong>{" "}
                      {ticket.category ? currencyFormat.format(ticket.category.price) : "-"}
                    </span>
                  </div>

                  <div className="ticket-bottom">
                    <div className="ticket-code mono">{ticket.ticket_code}</div>
                    <div className="ticket-actions">
                      <span className={`chip dot ${ticket.status}`}>{ticket.status}</span>
                      {adminCanMutate ? (
                        <>
                          <button className="btn btn-ghost btn-sm" type="button" onClick={() => openEditModal(ticket)}>
                            Edit
                          </button>
                          <button className="btn btn-danger btn-sm" type="button" onClick={() => openDeleteModal(ticket)}>
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <EmptyState
            title={isManagementView ? "Belum ada tiket yang cocok." : "Anda belum memiliki tiket."}
            description={
              isManagementView
                ? "Ubah filter atau issue tiket baru untuk customer."
                : "Tiket akan muncul di sini setelah order dan issue tiket dibuat."
            }
          />
        )}
      </div>

      <Modal
        open={modalState.type === "issue"}
        title="Issue Tiket"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>
              Batal
            </button>
            <button className="btn btn-primary" type="submit" form="issue-ticket-form">
              Buat Tiket
            </button>
          </>
        }
      >
        <form className="form-section" id="issue-ticket-form" onSubmit={handleIssueSubmit}>
          <label>
            Customer
            <select
              value={issueForm.customer_id}
              onChange={(event) =>
                setIssueForm((current) => ({
                  ...current,
                  customer_id: event.target.value,
                  order_id: "",
                }))
              }
            >
              <option value="">Pilih customer</option>
              {allCustomers.map((customer) => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.full_name}
                </option>
              ))}
            </select>
            {errors.customer_id ? <span className="form-error">{errors.customer_id}</span> : null}
          </label>

          <label>
            Ticket Category
            <select
              value={issueForm.category_id}
              onChange={(event) =>
                setIssueForm((current) => ({
                  ...current,
                  category_id: event.target.value,
                  order_id: "",
                  seat_id: "",
                }))
              }
            >
              <option value="">Pilih category</option>
              {managedCategories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name} - {currencyFormat.format(category.price)}
                </option>
              ))}
            </select>
            {errors.category_id ? <span className="form-error">{errors.category_id}</span> : null}
          </label>

          <label>
            Order
            <select
              value={issueForm.order_id}
              onChange={(event) =>
                setIssueForm((current) => ({
                  ...current,
                  order_id: event.target.value,
                }))
              }
            >
              <option value="">Buat order otomatis</option>
              {availableOrders.map((order) => (
                <option key={order.order_id} value={order.order_id}>
                  {order.order_id} - {formatDateTime(order.order_date)}
                </option>
              ))}
            </select>
            <span className="hint">
              Jika tidak ada order yang cocok, sistem akan membuat order dummy berstatus paid.
            </span>
          </label>

          {issueVenue?.seating_type === "reserved" ? (
            <label>
              Seat
              <select
                value={issueForm.seat_id}
                onChange={(event) =>
                  setIssueForm((current) => ({
                    ...current,
                    seat_id: event.target.value,
                  }))
                }
              >
                <option value="">Tanpa Kursi</option>
                {issueSeatOptions.map((seat) => (
                  <option key={seat.seat_id} value={seat.seat_id}>
                    {seat.section} - Baris {seat.row_number}, No. {seat.seat_number}
                  </option>
                ))}
              </select>
              {errors.seat_id ? <span className="form-error">{errors.seat_id}</span> : null}
            </label>
          ) : null}

          <label>
            Status
            <select
              value={issueForm.status}
              onChange={(event) =>
                setIssueForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="used">used</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>

          <div className="helper-block">
            <div className="helper-text">
              <strong>Event:</strong> {issueEvent?.title || "-"}
            </div>
            <div className="helper-text">
              <strong>Venue:</strong> {issueVenue?.name || "-"}
            </div>
          </div>

          {errors.form ? <span className="form-error">{errors.form}</span> : null}
        </form>
      </Modal>

      <Modal
        open={modalState.type === "edit"}
        title="Edit Tiket"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>
              Batal
            </button>
            <button className="btn btn-primary" type="submit" form="edit-ticket-form">
              Simpan
            </button>
          </>
        }
      >
        {ticketBeingEdited ? (
          <form className="form-section" id="edit-ticket-form" onSubmit={handleEditSubmit}>
            <label>
              Kode Tiket
              <input type="text" value={ticketBeingEdited.ticket_code} disabled />
            </label>

            <label>
              Status
              <select
                value={editForm.status}
                onChange={(event) =>
                  setEditForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="active">active</option>
                <option value="pending">pending</option>
                <option value="used">used</option>
                <option value="cancelled">cancelled</option>
              </select>
            </label>

            {ticketBeingEdited.venue?.seating_type === "reserved" ? (
              <label>
                Seat
                <select
                  value={editForm.seat_id}
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      seat_id: event.target.value,
                    }))
                  }
                >
                  <option value="">Tanpa Kursi</option>
                  {editSeatOptions.map((seat) => (
                    <option key={seat.seat_id} value={seat.seat_id}>
                      {seat.section} - Baris {seat.row_number}, No. {seat.seat_number}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {errors.form ? <span className="form-error">{errors.form}</span> : null}
          </form>
        ) : null}
      </Modal>

      <Modal
        open={modalState.type === "delete"}
        title="Hapus Tiket"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>
              Batal
            </button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteTicket}>
              Hapus
            </button>
          </>
        }
      >
        {ticketBeingEdited ? (
          <div className="form-section">
            <p>
              Anda akan menghapus tiket <strong>{ticketBeingEdited.ticket_code}</strong> milik{" "}
              <strong>{ticketBeingEdited.customer?.full_name}</strong>.
            </p>
            <div className="warning-box">
              Ticket akan dihapus permanen dan relasi kursi akan dilepas sehingga seat kembali tersedia.
            </div>
          </div>
        ) : null}
      </Modal>

      <ToastStack items={toasts} />
    </>
  );
}

export default TicketPage;
