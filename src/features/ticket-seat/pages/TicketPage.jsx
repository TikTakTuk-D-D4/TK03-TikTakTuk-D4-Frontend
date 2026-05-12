import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  AccessDenied,
  EmptyState,
  Modal,
  PageHeader,
  StatCards,
  ToastStack,
} from "../components/TicketSeatShared";
import { getTickets, createTicket, updateTicketStatus, deleteTicket, getCustomers } from "../services/ticketService";
import { getTicketCategories } from "../../artist-ticket-category/services/ticketCategoryService";
import { getSeats } from "../services/seatService";
import { getOrders, createOrder } from "../../order-promotion/services/orderService";

const initialIssueForm = {
  customer_id: "",
  category_id: "",
  event_id: "",
  seat_id: "",
  status: "active",
};

const initialEditForm = {
  status: "active",
};

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function ticketSort(a, b) {
  if (!a.event?.event_datetime) return 1;
  if (!b.event?.event_datetime) return -1;
  return new Date(b.event.event_datetime).getTime() - new Date(a.event.event_datetime).getTime();
}

function getStatusLabel(status) {
  const labels = { active: "Scan Entry", pending: "Pending Check", used: "Used", cancelled: "Void" };
  return labels[status] || "E-Ticket";
}

function TicketPage() {
  const location = useLocation();
  const { user } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const isManagementView = user?.role === "admin" || user?.role === "organizer";
  const adminCanMutate = user?.role === "admin";

  const isManagementPath = location.pathname === "/manage-tickets";
  const accessDenied = isManagementPath && !isManagementView;

  useEffect(() => {
    const query = user?.role === "customer" ? { customer_id: user.customer_id } : {};
    Promise.all([
      getTickets(query),
      getCustomers(),
      getTicketCategories(),
    ])
      .then(([ticketsData, customersData, categoriesData]) => {
        setTickets(ticketsData);
        setCustomers(customersData);
        setCategories(categoriesData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!issueForm.event_id) { setAvailableSeats([]); return; }
    getSeats().then((seatsData) => {
      setAvailableSeats(seatsData.filter((s) => !s.is_taken));
    });
  }, [issueForm.event_id]);

  const refresh = () => {
    const query = user?.role === "customer" ? { customer_id: user.customer_id } : {};
    return getTickets(query).then(setTickets);
  };

  const pushToast = (message, type = "success") => {
    toastCounterRef.current += 1;
    const id = `ticket-toast-${toastCounterRef.current}`;
    setToasts((items) => [...items, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 2800);
  };

  const sortedTickets = tickets.slice().sort(ticketSort);

  const filteredTickets = sortedTickets.filter((ticket) => {
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
    { label: "Active", value: filteredTickets.filter((t) => t.status === "active").length, sub: "Tiket siap digunakan" },
    { label: "Pending", value: filteredTickets.filter((t) => t.status === "pending").length, sub: "Menunggu konfirmasi" },
    {
      label: "Used/Cancelled",
      value: filteredTickets.filter((t) => t.status === "used" || t.status === "cancelled").length,
      sub: "Sudah dipakai atau dibatalkan",
    },
  ];

  const ticketBeingEdited = tickets.find((t) => t.ticket_id === modalState.ticketId) || null;

  const issueCategory = categories.find((c) => c.id === issueForm.category_id);

  const openIssueModal = () => {
    setIssueForm({ ...initialIssueForm, customer_id: customers[0]?.customer_id || "" });
    setErrors({});
    setModalState({ type: "issue", ticketId: "" });
  };

  const openEditModal = (ticket) => {
    setEditForm({ status: ticket.status });
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

  const handleIssueSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!issueForm.customer_id) nextErrors.customer_id = "Customer wajib dipilih.";
    if (!issueForm.category_id) nextErrors.category_id = "Kategori tiket wajib dipilih.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const paymentStatus = issueForm.status === "active" ? "Paid" : "Pending";
      const order = await createOrder({
        customer_id: issueForm.customer_id,
        total_amount: issueCategory?.price || 0,
        payment_status: paymentStatus,
      });

      await createTicket({
        tcategory_id: issueForm.category_id,
        torder_id: order.id,
        seat_id: issueForm.seat_id || null,
      });

      await refresh();
      pushToast("Tiket baru berhasil di-issue.");
      closeModal();
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateTicketStatus(modalState.ticketId, editForm.status);
      await refresh();
      pushToast("Tiket berhasil diperbarui.");
      closeModal();
    } catch (err) {
      setErrors({ form: err.message });
    }
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket(modalState.ticketId);
      await refresh();
      pushToast("Tiket berhasil dihapus.");
      closeModal();
    } catch (err) {
      pushToast(err.message || "Gagal menghapus tiket.", "error");
    }
  };

  if (accessDenied) {
    return (
      <AccessDenied
        title="Manajemen Tiket hanya untuk Admin dan Organizer."
        description="Customer tidak dapat mengakses halaman issue dan pengelolaan tiket."
      />
    );
  }

  if (loading) {
    return (
      <div className="page ticket-seat-page">
        <p>Memuat data tiket...</p>
      </div>
    );
  }

  const uniqueEvents = [...new Map(
    tickets.map((t) => [t.event?.event_id, t.event]).filter(([id]) => Boolean(id))
  ).values()];

  const uniqueCategories = [...new Map(
    tickets.map((t) => [t.category?.category_id, t.category]).filter(([id]) => Boolean(id))
  ).values()];

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
                {uniqueEvents.map((ev) => (
                  <option key={ev.event_id} value={ev.event_id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                <option value="all">Semua Category</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
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
                      </div>
                    )}
                  </div>

                  <div className="ticket-meta">
                    <span><strong>Pelanggan:</strong> {ticket.customer?.full_name || "-"}</span>
                    <span><strong>Venue:</strong> {ticket.venue?.name || "-"}</span>
                    <span><strong>Jadwal:</strong> {formatDateTime(ticket.event?.event_datetime)}</span>
                    <span><strong>Seat:</strong> {ticket.seatLabel}</span>
                    <span>
                      <strong>Order:</strong>{" "}
                      <span className="mono">{ticket.order?.order_id || "-"}</span>
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
            <button className="btn btn-ghost" type="button" onClick={closeModal}>Batal</button>
            <button className="btn btn-primary" type="submit" form="issue-ticket-form">Buat Tiket</button>
          </>
        }
      >
        <form className="form-section" id="issue-ticket-form" onSubmit={handleIssueSubmit}>
          <label>
            Customer
            <select
              value={issueForm.customer_id}
              onChange={(event) => setIssueForm((f) => ({ ...f, customer_id: event.target.value }))}
            >
              <option value="">Pilih customer</option>
              {customers.map((customer) => (
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
              onChange={(event) => {
                const cat = categories.find((c) => c.id === event.target.value);
                setIssueForm((f) => ({
                  ...f,
                  category_id: event.target.value,
                  event_id: cat?.eventId || "",
                  seat_id: "",
                }));
              }}
            >
              <option value="">Pilih category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {currencyFormat.format(cat.price)}
                </option>
              ))}
            </select>
            {errors.category_id ? <span className="form-error">{errors.category_id}</span> : null}
          </label>

          {availableSeats.length > 0 && (
            <label>
              Seat (opsional)
              <select
                value={issueForm.seat_id}
                onChange={(event) => setIssueForm((f) => ({ ...f, seat_id: event.target.value }))}
              >
                <option value="">Tanpa Kursi</option>
                {availableSeats.map((seat) => (
                  <option key={seat.seat_id} value={seat.seat_id}>
                    {seat.seatLabel}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Status
            <select
              value={issueForm.status}
              onChange={(event) => setIssueForm((f) => ({ ...f, status: event.target.value }))}
            >
              <option value="active">active</option>
              <option value="pending">pending</option>
              <option value="used">used</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>

          {issueCategory && (
            <div className="helper-block">
              <div className="helper-text">
                <strong>Harga:</strong> {currencyFormat.format(issueCategory.price)}
              </div>
            </div>
          )}

          {errors.form ? <span className="form-error">{errors.form}</span> : null}
        </form>
      </Modal>

      <Modal
        open={modalState.type === "edit"}
        title="Edit Tiket"
        onClose={closeModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeModal}>Batal</button>
            <button className="btn btn-primary" type="submit" form="edit-ticket-form">Simpan</button>
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
                onChange={(event) => setEditForm((f) => ({ ...f, status: event.target.value }))}
              >
                <option value="active">active</option>
                <option value="pending">pending</option>
                <option value="used">used</option>
                <option value="cancelled">cancelled</option>
              </select>
            </label>
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
            <button className="btn btn-ghost" type="button" onClick={closeModal}>Batal</button>
            <button className="btn btn-danger" type="button" onClick={handleDeleteTicket}>Hapus</button>
          </>
        }
      >
        {ticketBeingEdited ? (
          <div className="form-section">
            <p>
              Anda akan menghapus tiket <strong>{ticketBeingEdited.ticket_code}</strong> milik{" "}
              <strong>{ticketBeingEdited.customer?.full_name || "customer"}</strong>.
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
