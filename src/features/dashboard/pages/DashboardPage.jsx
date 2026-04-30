import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPageUser, updateCurrentUser, updateUserPassword } from "../../auth/services/authService";
import { events } from "../../../mocks/events";
import { venues } from "../../../mocks/venues";
import { orders } from "../../../mocks/orders";
import { tickets } from "../../../mocks/tickets";
import { customers } from "../../../mocks/customers";
import { ticketCategories } from "../../../mocks/ticketCategories";
import { promotions } from "../../../mocks/promotions";
import { mockArtists } from "../../../data/mockArtists";
import { Modal } from "../../ticket-seat/components/TicketSeatShared";

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateTimeFormat.format(date);
}

function getEventId(event) {
  return event?.event_id || event?.id || "";
}

function getEventTitle(event) {
  return event?.event_title || event?.title || event?.name || "Event";
}

function getEventDateTime(event) {
  if (event?.event_datetime) return event.event_datetime;
  if (event?.date && event?.time) {
    return `${event.date}T${event.time}:00+07:00`;
  }
  return event?.date || null;
}

function getVenueName(venue) {
  return venue?.venue_name || venue?.name || "Venue";
}

function getOrderId(order) {
  return order?.order_id || order?.id || "-";
}

function getOrderDate(order) {
  return order?.order_date || order?.date || null;
}

function getOrderStatus(order) {
  return order?.payment_status || order?.paymentStatus || "pending";
}

function getOrderAmount(order) {
  return Number(order?.total_amount ?? order?.totalAmount ?? 0);
}

function getOrderCustomerId(order) {
  return order?.customer_id || order?.customerId || "";
}

function getOrderEventId(order) {
  return order?.event_id || order?.eventId || "";
}

function getTicketOrderId(ticket) {
  return ticket?.torder_id || ticket?.order_id || ticket?.orderId || "";
}

function getTicketCode(ticket) {
  return ticket?.ticket_code || ticket?.code || ticket?.id || "-";
}

function getDisplayName(user) {
  return user?.name || user?.full_name || user?.organizer_name || user?.username || "User";
}

function isValidEmail(value) {
  return /.+@.+\..+/.test(value);
}

function getStatusLabel(status) {
  switch (status) {
    case "paid":
      return "Lunas";
    case "pending":
      return "Pending";
    case "cancelled":
      return "Dibatalkan";
    case "active":
      return "Aktif";
    case "used":
      return "Terpakai";
    default:
      return "Pending";
  }
}

function getStatusClass(status) {
  if (status === "paid" || status === "active") return "active";
  if (status === "pending") return "pending";
  if (status === "used" || status === "cancelled") return "cancelled";
  return "pending";
}

function DashboardPage() {
  const [user, setUser] = useState(() => getPageUser());
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone_number: "",
    organizer_name: "",
    contact_email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const handleUserUpdate = (event) => {
      setUser(event?.detail || getPageUser());
    };

    window.addEventListener("tiktaktuk:user", handleUserUpdate);
    return () => window.removeEventListener("tiktaktuk:user", handleUserUpdate);
  }, []);

  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";
  const isCustomer = user?.role === "customer";
  const canEditProfile = isCustomer || isOrganizer;
  const organizerId = user?.organizer_id || user?.organizerId || "org-001";
  const customerId = user?.customer_id || user?.customerId || "cust-001";

  const eventById = new Map(events.map((event) => [getEventId(event), event]));
  const venueById = new Map(venues.map((venue) => [venue.venue_id || venue.id, venue]));
  const customerById = new Map(customers.map((customer) => [customer.customer_id || customer.id, customer]));
  const organizerEventIds = new Set(
    events.filter((event) => event.organizer_id === organizerId).map(getEventId),
  );

  const visibleEvents = isOrganizer
    ? events.filter((event) => event.organizer_id === organizerId)
    : events;
  const visibleVenues = isOrganizer
    ? venues.filter((venue) => venue.organizer_id === organizerId)
    : venues;
  const visibleOrders = isCustomer
    ? orders.filter((order) => getOrderCustomerId(order) === customerId)
    : isOrganizer
      ? orders.filter((order) => organizerEventIds.has(getOrderEventId(order)))
      : orders;

  const orderById = new Map(orders.map((order) => [getOrderId(order), order]));

  const visibleTickets = isCustomer
    ? tickets.filter((ticket) => {
        const order = orderById.get(getTicketOrderId(ticket));
        return order && getOrderCustomerId(order) === customerId;
      })
    : isOrganizer
      ? tickets.filter((ticket) => {
          const order = orderById.get(getTicketOrderId(ticket));
          return order && organizerEventIds.has(getOrderEventId(order));
        })
      : tickets;

  const paidOrders = visibleOrders.filter((order) => getOrderStatus(order) === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
  const activePromos = promotions.filter((promo) => promo.active).length;
  const activeTickets = visibleTickets.filter((ticket) => ticket.status === "active").length;
  const pendingOrders = visibleOrders.filter((order) => getOrderStatus(order) === "pending").length;

  const stats = isCustomer
    ? [
        { label: "Total Order", value: visibleOrders.length, sub: "Semua transaksi kamu" },
        { label: "Lunas", value: paidOrders.length, sub: "Pembayaran sukses" },
        { label: "Tiket Aktif", value: activeTickets, sub: "Siap digunakan" },
        { label: "Promo Aktif", value: activePromos, sub: "Bisa dipakai" },
      ]
    : [
        { label: "Total Event", value: visibleEvents.length, sub: "Event terdaftar" },
        { label: "Total Order", value: visibleOrders.length, sub: "Order masuk" },
        { label: "Total Tiket", value: visibleTickets.length, sub: "Tiket diterbitkan" },
        { label: "Revenue", value: currencyFormat.format(paidRevenue), sub: "Pembayaran lunas" },
      ];

  const highlightCards = isCustomer
    ? [
        { label: "Event tersedia", value: visibleEvents.length },
        { label: "Order pending", value: pendingOrders },
        { label: "Kategori tiket", value: ticketCategories.length },
      ]
    : [
        { label: "Venue aktif", value: visibleVenues.length },
        { label: "Artist terdaftar", value: mockArtists.length },
        { label: "Promo aktif", value: activePromos },
      ];

  const upcomingEvents = [...visibleEvents]
    .sort((a, b) => new Date(getEventDateTime(a)) - new Date(getEventDateTime(b)))
    .slice(0, 4);

  const recentOrders = [...visibleOrders]
    .sort((a, b) => new Date(getOrderDate(b)) - new Date(getOrderDate(a)))
    .slice(0, 4);

  const ticketItems = visibleTickets.slice(0, 4).map((ticket) => {
    const order = orderById.get(getTicketOrderId(ticket));
    const event = order ? eventById.get(getOrderEventId(order)) : null;
    return {
      id: ticket.ticket_id || ticket.id,
      code: getTicketCode(ticket),
      status: ticket.status,
      eventTitle: getEventTitle(event),
      orderId: getOrderId(order),
    };
  });

  const roleLabel = isAdmin ? "Administrator" : isOrganizer ? "Organizer" : "Customer";
  const displayName = getDisplayName(user);

  const profileRows = [
    { label: "Username", value: user?.username || "-" },
    { label: "User ID", value: user?.user_id || user?.id || "-" },
  ];

  if (isOrganizer) {
    profileRows.push({ label: "Organizer ID", value: organizerId });
    profileRows.push({ label: "Nama Organizer", value: user?.organizer_name || user?.name || "-" });
    profileRows.push({ label: "Email Kontak", value: user?.contact_email || "-" });
  }

  if (isCustomer) {
    profileRows.push({ label: "Customer ID", value: customerId });
    profileRows.push({ label: "Nama Lengkap", value: user?.full_name || user?.name || "-" });
    profileRows.push({ label: "No. Telepon", value: user?.phone_number || "-" });
  }

  const quickActions = isCustomer
    ? [
        { label: "Cari Event", path: "/events", variant: "primary" },
        { label: "Tiket Saya", path: "/my-tickets", variant: "ghost" },
        { label: "Lihat Promosi", path: "/promotions", variant: "ghost" },
      ]
    : isOrganizer
      ? [
          { label: "Buat Event", path: "/events/create", variant: "primary" },
          { label: "Tambah Venue", path: "/venues/create", variant: "ghost" },
          { label: "Manajemen Tiket", path: "/manage-tickets", variant: "ghost" },
        ]
      : [
          { label: "Tambah Event", path: "/events/create", variant: "primary" },
          { label: "Tambah Venue", path: "/venues/create", variant: "ghost" },
          { label: "Kelola Artist", path: "/artists", variant: "ghost" },
        ];

  const openProfileModal = () => {
    setProfileErrors({});
    setProfileMessage("");
    setProfileForm({
      full_name: user?.full_name || user?.name || "",
      phone_number: user?.phone_number || "",
      organizer_name: user?.organizer_name || user?.name || "",
      contact_email: user?.contact_email || "",
    });
    setProfileOpen(true);
  };

  const closeProfileModal = () => {
    setProfileOpen(false);
    setProfileErrors({});
    setProfileMessage("");
  };

  const openPasswordModal = () => {
    setPasswordErrors({});
    setPasswordMessage("");
    setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    setPasswordOpen(true);
  };

  const closePasswordModal = () => {
    setPasswordOpen(false);
    setPasswordErrors({});
    setPasswordMessage("");
  };

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    if (!canEditProfile) {
      setProfileErrors({ form: "Profil untuk role ini tidak dapat diubah." });
      return;
    }

    const nextErrors = {};

    if (isCustomer) {
      if (!profileForm.full_name.trim()) {
        nextErrors.full_name = "Nama lengkap wajib diisi.";
      }
      if (!profileForm.phone_number.trim()) {
        nextErrors.phone_number = "Nomor telepon wajib diisi.";
      }
    }

    if (isOrganizer) {
      if (!profileForm.organizer_name.trim()) {
        nextErrors.organizer_name = "Nama organizer wajib diisi.";
      }
      if (!profileForm.contact_email.trim()) {
        nextErrors.contact_email = "Email kontak wajib diisi.";
      } else if (!isValidEmail(profileForm.contact_email.trim())) {
        nextErrors.contact_email = "Format email tidak valid.";
      }
    }

    if (Object.keys(nextErrors).length) {
      setProfileErrors(nextErrors);
      return;
    }

    const patch = isCustomer
      ? {
          name: profileForm.full_name.trim(),
          full_name: profileForm.full_name.trim(),
          phone_number: profileForm.phone_number.trim(),
        }
      : {
          name: profileForm.organizer_name.trim(),
          organizer_name: profileForm.organizer_name.trim(),
          contact_email: profileForm.contact_email.trim(),
        };

    const updated = updateCurrentUser(patch);
    setUser(updated);
    setProfileErrors({});
    setProfileMessage("Profil berhasil diperbarui.");
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!passwordForm.current_password) {
      nextErrors.current_password = "Password lama wajib diisi.";
    }

    if (!passwordForm.new_password) {
      nextErrors.new_password = "Password baru wajib diisi.";
    } else if (passwordForm.new_password.length < 6) {
      nextErrors.new_password = "Password minimal 6 karakter.";
    }

    if (!passwordForm.confirm_password) {
      nextErrors.confirm_password = "Konfirmasi password wajib diisi.";
    } else if (passwordForm.confirm_password !== passwordForm.new_password) {
      nextErrors.confirm_password = "Konfirmasi tidak cocok.";
    }

    if (passwordForm.current_password === passwordForm.new_password) {
      nextErrors.new_password = "Password baru harus berbeda.";
    }

    if (Object.keys(nextErrors).length) {
      setPasswordErrors(nextErrors);
      return;
    }

    const result = updateUserPassword({
      currentPassword: passwordForm.current_password,
      nextPassword: passwordForm.new_password,
    });

    if (!result.ok) {
      setPasswordErrors({ form: result.error || "Gagal mengubah password." });
      return;
    }

    setUser(result.user);
    setPasswordErrors({});
    setPasswordMessage("Password berhasil diubah.");
    setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <div className="page dashboard">
      <section className="dashboard-hero">
        <div className="dashboard-hero-top">
          <div className="dashboard-hero-copy">
            <span className="hero-pill">{roleLabel} Dashboard</span>
            <h1>Halo, {displayName}</h1>
            <p>
              Ringkasan aktivitas TikTakTuk untuk peran {roleLabel.toLowerCase()} dan akses cepat
              ke fitur utama.
            </p>
            <div className="dashboard-hero-chips">
              <span className="chip">@{user?.username || "demo"}</span>
              <span className="chip mono">{user?.user_id || user?.id || "user-demo"}</span>
              <span className="chip">Role: {roleLabel}</span>
            </div>
          </div>
          <div className="dashboard-meta-grid">
            {highlightCards.map((item) => (
              <div className="meta-card" key={item.label}>
                <b>{item.value}</b>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <span className="label">{stat.label}</span>
              <span className="val">{stat.value}</span>
              <span className="sub">{stat.sub}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="dashboard-stack">
          <section className="surface-card pad">
            <div className="section-head">
              <div>
                <h2>{isCustomer ? "Tiket Saya" : "Event Terdekat"}</h2>
                <p>{isCustomer ? "Ringkasan tiket yang kamu miliki." : "Agenda event terdekat."}</p>
              </div>
              <Link className="btn btn-ghost btn-sm" to={isCustomer ? "/my-tickets" : "/events"}>
                Lihat semua
              </Link>
            </div>

            <div className="dashboard-list">
              {isCustomer
                ? ticketItems.map((ticket) => (
                    <div className="dashboard-item" key={ticket.id}>
                      <div>
                        <strong className="dashboard-item-title mono">{ticket.code}</strong>
                        <div className="dashboard-item-meta">
                          {ticket.eventTitle} - Order {ticket.orderId}
                        </div>
                      </div>
                      <div className="dashboard-item-right">
                        <span className={`chip dot ${getStatusClass(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </div>
                  ))
                : upcomingEvents.map((event) => {
                    const venue = venueById.get(event.venue_id || event.venueId);
                    return (
                      <div className="dashboard-item" key={getEventId(event)}>
                        <div>
                          <strong className="dashboard-item-title">{getEventTitle(event)}</strong>
                          <div className="dashboard-item-meta">
                            {formatDateTime(getEventDateTime(event))} - {getVenueName(venue)}
                          </div>
                        </div>
                        <div className="dashboard-item-right">
                          <span className="chip dot purple">Upcoming</span>
                        </div>
                      </div>
                    );
                  })}

              {isCustomer && ticketItems.length === 0 ? (
                <div className="dashboard-empty">Belum ada tiket. Jelajahi event untuk membeli.</div>
              ) : null}
              {!isCustomer && upcomingEvents.length === 0 ? (
                <div className="dashboard-empty">Belum ada event terdekat.</div>
              ) : null}
            </div>
          </section>

          <section className="surface-card pad">
            <div className="section-head">
              <div>
                <h2>Order Terbaru</h2>
                <p>Daftar order yang paling baru masuk.</p>
              </div>
              <Link className="btn btn-ghost btn-sm" to="/orders">
                Kelola order
              </Link>
            </div>

            <div className="dashboard-list">
              {recentOrders.map((order) => {
                const event = eventById.get(getOrderEventId(order));
                const customer = customerById.get(getOrderCustomerId(order));
                const status = getOrderStatus(order);

                return (
                  <div className="dashboard-item" key={getOrderId(order)}>
                    <div>
                      <strong className="dashboard-item-title mono">{getOrderId(order)}</strong>
                      <div className="dashboard-item-meta">
                        {getEventTitle(event)} - {customer?.full_name || customer?.name || "Customer"}
                      </div>
                    </div>
                    <div className="dashboard-item-right">
                      <span className="dashboard-item-amount">
                        {currencyFormat.format(getOrderAmount(order))}
                      </span>
                      <span className={`chip dot ${getStatusClass(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentOrders.length === 0 ? (
                <div className="dashboard-empty">Belum ada order yang masuk.</div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="dashboard-stack">
          <section className="surface-card pad profile-card">
            <div className="profile-head">
              <div className="avatar">{displayName.charAt(0)}</div>
              <div className="profile-name">
                <strong>{displayName}</strong>
                <span>{roleLabel} Account</span>
              </div>
            </div>

            <div className="profile-rows">
              {profileRows.map((row) => (
                <div className="profile-row" key={row.label}>
                  <span>{row.label}</span>
                  <strong className="mono">{row.value}</strong>
                </div>
              ))}
            </div>

            <div className="dashboard-hero-chips">
              <button className="btn btn-ghost btn-sm" type="button" onClick={openProfileModal}>
                Edit Profil
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={openPasswordModal}>
                Update Password
              </button>
            </div>
          </section>

          <section className="surface-card pad quick-actions">
            <div>
              <h2>Akses Cepat</h2>
              <p className="helper-text">Langsung ke halaman yang sering digunakan.</p>
            </div>

            {quickActions.map((action) => (
              <Link
                key={action.label}
                className={`btn ${action.variant === "primary" ? "btn-primary" : "btn-ghost"}`}
                to={action.path}
              >
                {action.label}
                <span>-&gt;</span>
              </Link>
            ))}
          </section>
        </aside>
      </div>

      <Modal
        open={profileOpen}
        title="Update Profil"
        onClose={closeProfileModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closeProfileModal}>
              Batal
            </button>
            <button
              className="btn btn-primary"
              type="submit"
              form="profile-form"
              disabled={!canEditProfile}
            >
              Simpan
            </button>
          </>
        }
      >
        <form className="form-section" id="profile-form" onSubmit={handleProfileSubmit}>
          <label>
            Username
            <input type="text" value={user?.username || ""} disabled />
            <span className="hint">Username tidak dapat diubah.</span>
          </label>

          {isCustomer ? (
            <>
              <label>
                Nama Lengkap
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, full_name: event.target.value }))
                  }
                />
                {profileErrors.full_name ? <span className="form-error">{profileErrors.full_name}</span> : null}
              </label>
              <label>
                No. Telepon
                <input
                  type="text"
                  value={profileForm.phone_number}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone_number: event.target.value }))
                  }
                />
                {profileErrors.phone_number ? (
                  <span className="form-error">{profileErrors.phone_number}</span>
                ) : null}
              </label>
            </>
          ) : null}

          {isOrganizer ? (
            <>
              <label>
                Nama Organizer
                <input
                  type="text"
                  value={profileForm.organizer_name}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, organizer_name: event.target.value }))
                  }
                />
                {profileErrors.organizer_name ? (
                  <span className="form-error">{profileErrors.organizer_name}</span>
                ) : null}
              </label>
              <label>
                Email Kontak
                <input
                  type="email"
                  value={profileForm.contact_email}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, contact_email: event.target.value }))
                  }
                />
                {profileErrors.contact_email ? (
                  <span className="form-error">{profileErrors.contact_email}</span>
                ) : null}
              </label>
            </>
          ) : null}

          {!canEditProfile ? (
            <div className="helper-block">
              Akun {roleLabel.toLowerCase()} tidak memiliki data profil yang bisa diperbarui.
            </div>
          ) : null}

          {profileErrors.form ? <span className="form-error">{profileErrors.form}</span> : null}
          {profileMessage ? <span className="hint">{profileMessage}</span> : null}
        </form>
      </Modal>

      <Modal
        open={passwordOpen}
        title="Update Password"
        onClose={closePasswordModal}
        footer={
          <>
            <button className="btn btn-ghost" type="button" onClick={closePasswordModal}>
              Batal
            </button>
            <button className="btn btn-primary" type="submit" form="password-form">
              Simpan
            </button>
          </>
        }
      >
        <form className="form-section" id="password-form" onSubmit={handlePasswordSubmit}>
          <label>
            Password Lama
            <input
              type="password"
              value={passwordForm.current_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, current_password: event.target.value }))
              }
            />
            {passwordErrors.current_password ? (
              <span className="form-error">{passwordErrors.current_password}</span>
            ) : null}
          </label>
          <label>
            Password Baru
            <input
              type="password"
              value={passwordForm.new_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, new_password: event.target.value }))
              }
            />
            {passwordErrors.new_password ? (
              <span className="form-error">{passwordErrors.new_password}</span>
            ) : null}
          </label>
          <label>
            Konfirmasi Password
            <input
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) =>
                setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))
              }
            />
            {passwordErrors.confirm_password ? (
              <span className="form-error">{passwordErrors.confirm_password}</span>
            ) : null}
          </label>
          {passwordErrors.form ? <span className="form-error">{passwordErrors.form}</span> : null}
          {passwordMessage ? <span className="hint">{passwordMessage}</span> : null}
        </form>
      </Modal>
    </div>
  );
}

export default DashboardPage;
