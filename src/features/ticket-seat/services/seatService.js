import { getTicketSeatSnapshot } from "./ticketSeatStore";

export function getSeats() {
  return getTicketSeatSnapshot().seats;
}
