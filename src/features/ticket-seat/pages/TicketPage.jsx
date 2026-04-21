import { getTickets } from "../services/ticketService";

function TicketPage() {
  const tickets = getTickets();

  return (
    <div className="page">
      <h1>Ticket Page</h1>
      <div className="grid">
        {tickets.map((ticket) => (
          <div className="card" key={ticket.id}>
            <h3>{ticket.code}</h3>
            <p>Event: {ticket.eventName}</p>
            <p>Status: {ticket.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketPage;