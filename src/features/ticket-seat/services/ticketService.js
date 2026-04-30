import { getTicketSeatSnapshot } from "./ticketSeatStore";

export function getTickets() {
  return getTicketSeatSnapshot().tickets;
}
