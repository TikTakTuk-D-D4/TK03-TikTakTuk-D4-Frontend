import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPageUser } from "../../auth/services/authService";
import { getEvents } from "../../venue-event/services/eventService";
import { getVenues } from "../../venue-event/services/venueService";
import { getOrders } from "../../order-promotion/services/orderService";
import { getTickets } from "../../ticket-seat/services/ticketService";
import { getArtists } from "../../artist-ticket-category/services/artistService";
import { getPromotions } from "../../order-promotion/services/promotionService";
import { getTicketCategories } from "../../artist-ticket-category/services/ticketCategoryService";

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

function getStatusLabel(status) {
  switch (status?.toLowerCase()) {
    case "paid": case "active": return "Aktif";
    case "pending": return "Pending";
    case "cancelled": return "Dibatalkan";
    default: return "Pending";
  }
}

function getStatusClass(status) {
  const s = status?.toLowerCase();
  if (s === "paid" || s === "active") return "active";
  if (s === "pending") return "pending";
  return "cancelled";
}

function isPromoActive(promo) {
  const now = new Date();
  const start = promo.startDate ? new Date(promo.startDate) : null;
  const end = promo.endDate ? new Date(promo.endDate) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

function getDisplayName(user) {
  return user?.name || user?.full_name || user?.organizer_name || user?.username || "User";
}

function DashboardPage() {
  const [user, setUser] = useState(() => getPageUser());
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [artists, setArtists] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "admin";
  const isOrganizer = user?.role === "organizer";
  const isCustomer = user?.role === "customer";
  const organizerId = user?.organizer_id || user?.organizerId;
  const customerId = user?.customer_id || user?.customerId;

  useEffect(() => {
    const handleUserUpdate = (e) => setUser(e?.detail || getPageUser());
    window.addEventListener("tiktaktuk:user", handleUserUpdate);
    return () => window.removeEventListener("tiktaktuk:user", handleUserUpdate);
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      getEvents().then(setEvents).catch(() => {}),
      getVenues().then(setVenues).catch(() => {}),
      getArtists().then(setArtists).catch(() => {}),
      getPromotions().then(setPromotions).catch(() => {}),
      getOrders(user).then(setOrders).catch(() => {}),
      (isCustomer ? getTickets({ customer_id: customerId }) : getTickets()).then(setTickets).catch(() => {}),
      isCustomer ? getTicketCategories().then(setTicketCategories).catch(() => {}) : Promise.resolve(),
    ]).finally(() => setLoading(false));
  }, [user]);

  const visibleEvents = isOrganizer
    ? events.filter((e) => e.organizerId === organizerId)
    : events;

  const activePromoCount = promotions.filter(isPromoActive).length;
  const paidOrders = orders.filter((o) => o.paymentStatus === "PAID");
  const paidRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrderCount = orders.filter((o) => o.paymentStatus === "PENDING").length;
  const activeTicketCount = tickets.filter((t) => t.status === "active").length;

  const stats = isCustomer
    ? [
        { label: "Total Order", value: orders.length, sub: "Semua transaksi kamu" },
        { label: "Lunas", value: paidOrders.length, sub: "Pembayaran sukses" },
        { label: "Tiket Aktif", value: activeTicketCount, sub: "Siap digunakan" },
        { label: "Promo Aktif", value: activePromoCount, sub: "Bisa dipakai" },
      ]
    : [
        { label: "Total Event", value: visibleEvents.length, sub: "Event terdaftar" },
        { label: "Total Order", value: orders.length, sub: "Order masuk" },
        { label: "Total Tiket", value: tickets.length, sub: "Tiket diterbitkan" },
        { label: "Revenue", value: currencyFormat.format(paidRevenue), sub: "Pembayaran lunas" },
      ];

  const highlightCards = isCustomer
    ? [
        { label: "Event tersedia", value: events.length },
        { label: "Order pending", value: pendingOrderCount },
        { label: "Kategori tiket", value: ticketCategories.length },
      ]
    : [
        { label: "Venue aktif", value: venues.length },
        { label: "Artist terdaftar", value: artists.length },
        { label: "Promo aktif", value: activePromoCount },
      ];

  const upcomingEvents = [...visibleEvents]
    .sort((a, b) => new Date(a.event_datetime) - new Date(b.event_datetime))
    .slice(0, 4);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    .slice(0, 4);

  const ticketItems = tickets.slice(0, 4).map((ticket) => ({
    id: ticket.ticket_id,
    code: ticket.ticket_code,
    status: ticket.status,
    eventTitle: ticket.event?.title || "-",
    orderId: ticket.order?.order_id || "-",
  }));

  const roleLabel = isAdmin ? "Administrator" : isOrganizer ? "Organizer" : "Customer";
  const displayName = getDisplayName(user);

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
        ];

  if (loading) {
    return (
      <div className="page dashboard">
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
          Memuat data dashboard...
        </div>
      </div>
    );
  }

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
                          {ticket.eventTitle} &mdash; Order {ticket.orderId}
                        </div>
                      </div>
                      <div className="dashboard-item-right">
                        <span className={`chip dot ${getStatusClass(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                    </div>
                  ))
                : upcomingEvents.map((event) => (
                    <div className="dashboard-item" key={event.id}>
                      <div>
                        <strong className="dashboard-item-title">{event.title}</strong>
                        <div className="dashboard-item-meta">
                          {formatDateTime(event.event_datetime)} &mdash; {event.venueName || "-"}
                        </div>
                      </div>
                      <div className="dashboard-item-right">
                        <span className="chip dot purple">Upcoming</span>
                      </div>
                    </div>
                  ))}

              {isCustomer && ticketItems.length === 0 && (
                <div className="dashboard-empty">Belum ada tiket. Jelajahi event untuk membeli.</div>
              )}
              {!isCustomer && upcomingEvents.length === 0 && (
                <div className="dashboard-empty">Belum ada event terdekat.</div>
              )}
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
              {recentOrders.map((order) => (
                <div className="dashboard-item" key={order.id}>
                  <div>
                    <strong className="dashboard-item-title mono">{order.id}</strong>
                    <div className="dashboard-item-meta">{order.customerName}</div>
                  </div>
                  <div className="dashboard-item-right">
                    <span className="dashboard-item-amount">
                      {currencyFormat.format(order.totalAmount)}
                    </span>
                    <span className={`chip dot ${getStatusClass(order.paymentStatus)}`}>
                      {getStatusLabel(order.paymentStatus)}
                    </span>
                  </div>
                </div>
              ))}

              {recentOrders.length === 0 && (
                <div className="dashboard-empty">Belum ada order yang masuk.</div>
              )}
            </div>
          </section>
        </div>

        <aside className="dashboard-stack">
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
    </div>
  );
}

export default DashboardPage;
