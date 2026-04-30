import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPageUser } from "../../auth/services/authService";
import { events } from "../../../mocks/events";
import { venues } from "../../../mocks/venues";
import { orders } from "../../../mocks/orders";
import { tickets } from "../../../mocks/tickets";
import { customers } from "../../../mocks/customers";
import { ticketCategories } from "../../../mocks/ticketCategories";
import { promotions } from "../../../mocks/promotions";
import { mockArtists } from "../../../data/mockArtists";

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
