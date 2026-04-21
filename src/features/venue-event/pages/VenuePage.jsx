import { getVenues } from "../services/venueService";

function VenuePage() {
  const venues = getVenues();

  return (
    <div className="page">
      <h1>Venue Page</h1>
      <div className="grid">
        {venues.map((venue) => (
          <div className="card" key={venue.id}>
            <h3>{venue.name}</h3>
            <p>Kota: {venue.city}</p>
            <p>Kapasitas: {venue.capacity}</p>
            <p>Seating: {venue.seatingType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VenuePage;