import { getEvents } from "../services/eventService";

function EventPage() {
  const events = getEvents();

  return (
    <div className="page">
      <h1>Event Page</h1>
      <div className="grid">
        {events.map((event) => (
          <div className="card" key={event.id}>
            <h3>{event.title}</h3>
            <p>Venue: {event.venueName}</p>
            <p>Artist: {event.artistName}</p>
            <p>Harga mulai: Rp {event.startPrice}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventPage;