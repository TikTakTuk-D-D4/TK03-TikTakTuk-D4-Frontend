import { customers as initialCustomers } from "../../../mocks/customers";
import { events as initialEvents } from "../../../mocks/events";
import { hasRelationships as initialHasRelationships } from "../../../mocks/hasRelationships";
import { orders as initialOrders } from "../../../mocks/orders";
import { seats as initialSeats } from "../../../mocks/seats";
import { ticketCategories as initialTicketCategories } from "../../../mocks/ticketCategories";
import { tickets as initialTickets } from "../../../mocks/tickets";
import { venues as initialVenues } from "../../../mocks/venues";

const listeners = new Set();

const cloneItems = (items) => items.map((item) => ({ ...item }));

let state = {
  customers: cloneItems(initialCustomers),
  events: cloneItems(initialEvents),
  hasRelationships: cloneItems(initialHasRelationships),
  orders: cloneItems(initialOrders),
  seats: cloneItems(initialSeats),
  ticketCategories: cloneItems(initialTicketCategories),
  tickets: cloneItems(initialTickets),
  venues: cloneItems(initialVenues),
};

let snapshot = createSnapshot(state);

function emitChange() {
  snapshot = createSnapshot(state);
  listeners.forEach((listener) => listener());
}

function createSnapshot(source) {
  return {
    customers: source.customers,
    events: source.events,
    hasRelationships: source.hasRelationships,
    orders: source.orders,
    seats: source.seats,
    ticketCategories: source.ticketCategories,
    tickets: source.tickets,
    venues: source.venues,
  };
}

function updateState(recipe) {
  state = recipe(state);
  emitChange();
}

function findTicket(ticketId) {
  return state.tickets.find((ticket) => ticket.ticket_id === ticketId || ticket.id === ticketId);
}

function findSeat(seatId) {
  return state.seats.find((seat) => seat.seat_id === seatId || seat.id === seatId);
}

function findVenue(venueId) {
  return state.venues.find((venue) => venue.venue_id === venueId || venue.id === venueId);
}

function findEvent(eventId) {
  return state.events.find((eventItem) => eventItem.event_id === eventId || eventItem.id === eventId);
}

function findCategory(categoryId) {
  return state.ticketCategories.find(
    (category) => category.category_id === categoryId || category.id === categoryId,
  );
}

function findOrder(orderId) {
  return state.orders.find((order) => order.order_id === orderId || order.id === orderId);
}

function findCustomer(customerId) {
  return state.customers.find(
    (customer) => customer.customer_id === customerId || customer.id === customerId,
  );
}

function generateId(prefix, items, fieldName) {
  const maxNumber = items.reduce((highest, item) => {
    const raw = item[fieldName] || item.id || "";
    const match = String(raw).match(/(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(3, "0")}`;
}

function normalizeSeatPayload(payload) {
  return {
    seat_id: payload.seat_id,
    id: payload.seat_id,
    venue_id: payload.venue_id,
    venueId: payload.venue_id,
    section: payload.section.trim(),
    row_number: payload.row_number.trim().toUpperCase(),
    row: payload.row_number.trim().toUpperCase(),
    seat_number: payload.seat_number.trim(),
    number: payload.seat_number.trim(),
  };
}

function normalizeTicketPayload(payload) {
  return {
    ticket_id: payload.ticket_id,
    id: payload.ticket_id,
    ticket_code: payload.ticket_code,
    code: payload.ticket_code,
    tcategory_id: payload.category_id,
    category_id: payload.category_id,
    categoryId: payload.category_id,
    torder_id: payload.order_id,
    order_id: payload.order_id,
    orderId: payload.order_id,
    status: payload.status,
  };
}

function normalizeOrderPayload(payload) {
  return {
    order_id: payload.order_id,
    id: payload.order_id,
    order_date: payload.order_date,
    date: payload.order_date,
    payment_status: payload.payment_status,
    paymentStatus: payload.payment_status,
    total_amount: payload.total_amount,
    totalAmount: payload.total_amount,
    customer_id: payload.customer_id,
    customerId: payload.customer_id,
    event_id: payload.event_id,
    eventId: payload.event_id,
  };
}

function isDuplicateSeat(payload, excludeSeatId) {
  return state.seats.some((seat) => {
    if (seat.seat_id === excludeSeatId) {
      return false;
    }

    return (
      seat.venue_id === payload.venue_id &&
      seat.section.toLowerCase() === payload.section.trim().toLowerCase() &&
      seat.row_number.toLowerCase() === payload.row_number.trim().toLowerCase() &&
      seat.seat_number.toLowerCase() === payload.seat_number.trim().toLowerCase()
    );
  });
}

export function subscribeTicketSeatStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTicketSeatSnapshot() {
  return snapshot;
}

export function getSeatLabel(seat) {
  return `${seat.section} - Baris ${seat.row_number}, No. ${seat.seat_number}`;
}

export function canAccessTicketManagement(role) {
  return role === "admin" || role === "organizer";
}

export function canAccessSeatManagement(role) {
  return role === "admin" || role === "organizer";
}

export function isSeatTaken(seatId, currentTicketId) {
  return state.hasRelationships.some(
    (relation) =>
      relation.seat_id === seatId &&
      relation.ticket_id !== currentTicketId,
  );
}

export function getAvailableSeatsByVenue(venueId, currentTicketId) {
  return state.seats.filter(
    (seat) =>
      seat.venue_id === venueId &&
      !isSeatTaken(seat.seat_id, currentTicketId),
  );
}

export function generateTicketCode() {
  const year = new Date().getFullYear();
  const maxTicketNumber = state.tickets.reduce((highest, ticket) => {
    const match = String(ticket.ticket_code || ticket.code || "").match(/(\d+)$/);
    if (!match) return highest;
    return Math.max(highest, Number(match[1]));
  }, 0);

  return `TTK-${year}-${String(maxTicketNumber + 1).padStart(4, "0")}`;
}

export function assignSeatToTicket(ticketId, seatId) {
  if (!seatId) {
    return { ok: true };
  }

  const seat = findSeat(seatId);
  if (!seat) {
    return { ok: false, error: "Kursi yang dipilih tidak ditemukan." };
  }

  if (isSeatTaken(seatId, ticketId)) {
    return { ok: false, error: "Kursi sudah dipakai oleh tiket lain." };
  }

  updateState((prevState) => ({
    ...prevState,
    hasRelationships: [
      ...prevState.hasRelationships.filter((relation) => relation.ticket_id !== ticketId),
      { seat_id: seatId, ticket_id: ticketId },
    ],
  }));

  return { ok: true };
}

export function unassignSeatFromTicket(ticketId) {
  updateState((prevState) => ({
    ...prevState,
    hasRelationships: prevState.hasRelationships.filter((relation) => relation.ticket_id !== ticketId),
  }));

  return { ok: true };
}

export function createSeat(payload) {
  if (isDuplicateSeat(payload)) {
    return {
      ok: false,
      error: "Kombinasi venue, section, baris, dan nomor kursi sudah ada.",
    };
  }

  const seatId = generateId("sea-", state.seats, "seat_id");
  const seat = normalizeSeatPayload({ ...payload, seat_id: seatId });

  updateState((prevState) => ({
    ...prevState,
    seats: [seat, ...prevState.seats],
  }));

  return { ok: true, seat };
}

export function updateSeat(seatId, payload) {
  if (isDuplicateSeat(payload, seatId)) {
    return {
      ok: false,
      error: "Kombinasi venue, section, baris, dan nomor kursi sudah ada.",
    };
  }

  const existingSeat = findSeat(seatId);
  if (!existingSeat) {
    return { ok: false, error: "Kursi tidak ditemukan." };
  }

  const seat = normalizeSeatPayload({ ...payload, seat_id: seatId });

  updateState((prevState) => ({
    ...prevState,
    seats: prevState.seats.map((item) => (item.seat_id === seatId ? seat : item)),
  }));

  return { ok: true, seat };
}

export function deleteSeat(seatId) {
  const linkedRelations = state.hasRelationships.filter((relation) => relation.seat_id === seatId);
  const detachedTicketIds = linkedRelations.map((relation) => relation.ticket_id);

  updateState((prevState) => ({
    ...prevState,
    seats: prevState.seats.filter((seat) => seat.seat_id !== seatId),
    hasRelationships: prevState.hasRelationships.filter((relation) => relation.seat_id !== seatId),
  }));

  return { ok: true, detachedTicketIds };
}

export function createAutoOrder({ customer_id, category_id }) {
  const category = findCategory(category_id);
  const event = category ? findEvent(category.event_id) : null;

  if (!category || !event) {
    return { ok: false, error: "Kategori tiket tidak valid untuk membuat order." };
  }

  const orderId = generateId("ord-", state.orders, "order_id");
  const order = normalizeOrderPayload({
    order_id: orderId,
    order_date: new Date().toISOString(),
    payment_status: "paid",
    total_amount: category.price,
    customer_id,
    event_id: event.event_id,
  });

  updateState((prevState) => ({
    ...prevState,
    orders: [order, ...prevState.orders],
  }));

  return { ok: true, order };
}

export function issueTicket(payload) {
  const customer = findCustomer(payload.customer_id);
  const category = findCategory(payload.category_id);

  if (!customer) {
    return { ok: false, error: "Customer wajib dipilih." };
  }

  if (!category) {
    return { ok: false, error: "Kategori tiket wajib dipilih." };
  }

  let orderId = payload.order_id;

  if (!orderId) {
    const autoOrderResult = createAutoOrder({
      customer_id: payload.customer_id,
      category_id: payload.category_id,
    });

    if (!autoOrderResult.ok) {
      return autoOrderResult;
    }

    orderId = autoOrderResult.order.order_id;
  }

  const order = findOrder(orderId);
  if (!order) {
    return { ok: false, error: "Order tidak ditemukan." };
  }

  if (payload.seat_id && isSeatTaken(payload.seat_id)) {
    return { ok: false, error: "Kursi yang dipilih sudah dipakai tiket lain." };
  }

  const ticketId = generateId("tic-", state.tickets, "ticket_id");
  const ticket = normalizeTicketPayload({
    ticket_id: ticketId,
    ticket_code: generateTicketCode(),
    category_id: payload.category_id,
    order_id: orderId,
    status: payload.status,
  });

  updateState((prevState) => ({
    ...prevState,
    tickets: [ticket, ...prevState.tickets],
    hasRelationships: payload.seat_id
      ? [...prevState.hasRelationships, { seat_id: payload.seat_id, ticket_id: ticketId }]
      : prevState.hasRelationships,
  }));

  return { ok: true, ticket };
}

export function updateTicket(ticketId, payload) {
  const ticket = findTicket(ticketId);
  if (!ticket) {
    return { ok: false, error: "Tiket tidak ditemukan." };
  }

  if (payload.seat_id && isSeatTaken(payload.seat_id, ticketId)) {
    return { ok: false, error: "Kursi baru sudah dipakai oleh tiket lain." };
  }

  updateState((prevState) => ({
    ...prevState,
    tickets: prevState.tickets.map((item) =>
      item.ticket_id === ticketId
        ? { ...item, status: payload.status }
        : item,
    ),
    hasRelationships: [
      ...prevState.hasRelationships.filter((relation) => relation.ticket_id !== ticketId),
      ...(payload.seat_id ? [{ seat_id: payload.seat_id, ticket_id: ticketId }] : []),
    ],
  }));

  return { ok: true };
}

export function deleteTicket(ticketId) {
  updateState((prevState) => ({
    ...prevState,
    tickets: prevState.tickets.filter((ticket) => ticket.ticket_id !== ticketId),
    hasRelationships: prevState.hasRelationships.filter((relation) => relation.ticket_id !== ticketId),
  }));

  return { ok: true };
}

export function getSeatIdByTicketId(ticketId) {
  return state.hasRelationships.find((relation) => relation.ticket_id === ticketId)?.seat_id || null;
}

export function getManagedVenuesForUser(user) {
  if (!user) return [];
  if (user.role === "admin") return state.venues;
  if (user.role === "organizer") {
    return state.venues.filter((venue) => venue.organizer_id === user.organizer_id);
  }
  if (user.role === "customer") return state.venues;
  return [];
}

export function getManagedEventsForUser(user) {
  if (!user) return [];
  if (user.role === "admin") return state.events;
  if (user.role === "organizer") {
    return state.events.filter((eventItem) => eventItem.organizer_id === user.organizer_id);
  }
  return [];
}

export function getVisibleSeatsForUser(user) {
  if (user?.role === "customer") return state.seats;
  const managedVenues = getManagedVenuesForUser(user);
  const managedVenueIds = new Set(managedVenues.map((venue) => venue.venue_id));
  return state.seats.filter((seat) => managedVenueIds.has(seat.venue_id));
}

export function getVisibleTicketsForUser(user) {
  if (!user) return [];

  if (user.role === "admin") {
    return state.tickets;
  }

  if (user.role === "organizer") {
    const eventIds = new Set(getManagedEventsForUser(user).map((eventItem) => eventItem.event_id));
    const allowedCategoryIds = new Set(
      state.ticketCategories
        .filter((category) => eventIds.has(category.event_id))
        .map((category) => category.category_id),
    );

    return state.tickets.filter((ticket) => allowedCategoryIds.has(ticket.category_id));
  }

  if (user.role === "customer") {
    const orderIds = new Set(
      state.orders
        .filter((order) => order.customer_id === user.customer_id)
        .map((order) => order.order_id),
    );

    return state.tickets.filter((ticket) => orderIds.has(ticket.order_id));
  }

  return [];
}

export function getTicketViewModel(ticket) {
  const category = findCategory(ticket.category_id);
  const order = findOrder(ticket.order_id);
  const customer = order ? findCustomer(order.customer_id) : null;
  const eventItem = order ? findEvent(order.event_id) : category ? findEvent(category.event_id) : null;
  const venue = eventItem ? findVenue(eventItem.venue_id) : null;
  const seatId = getSeatIdByTicketId(ticket.ticket_id);
  const seat = seatId ? findSeat(seatId) : null;

  return {
    ...ticket,
    category,
    customer,
    event: eventItem,
    venue,
    order,
    seat,
    seatLabel: seat ? getSeatLabel(seat) : "Tanpa Kursi",
  };
}

export function getSeatViewModel(seat) {
  const venue = findVenue(seat.venue_id);
  const relation = state.hasRelationships.find((item) => item.seat_id === seat.seat_id);
  const ticket = relation ? findTicket(relation.ticket_id) : null;

  return {
    ...seat,
    venue,
    ticket,
    status: relation ? "Terpakai" : "Tersedia",
    seatLabel: getSeatLabel(seat),
  };
}
