import { getArtists } from "../services/artistService";

function ArtistPage() {
  const artists = getArtists();

  return (
    <div className="page">
      <h1>Artist Page</h1>
      <div className="grid">
        {artists.map((artist) => (
          <div className="card" key={artist.id}>
            <h3>{artist.name}</h3>
            <p>Genre: {artist.genre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArtistPage;