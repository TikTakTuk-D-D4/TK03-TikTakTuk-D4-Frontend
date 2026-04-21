import { getSeats } from "../services/seatService";

function SeatPage() {
  const seats = getSeats();

  return (
    <div className="page">
      <h1>Seat Page</h1>
      <div className="grid">
        {seats.map((seat) => (
          <div className="card" key={seat.id}>
            <h3>{seat.section}</h3>
            <p>Row: {seat.row}</p>
            <p>Seat: {seat.number}</p>
            <p>Status: {seat.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeatPage;