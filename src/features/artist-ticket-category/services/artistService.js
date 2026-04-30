import { mockArtists } from "../../../data/mockArtists";

let artistState = [...mockArtists];

function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `art-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function getArtists() {
  return [...artistState];
}

export function createArtist(payload) {
  const genre = typeof payload.genre === "string" ? payload.genre.trim() : payload.genre;

  const artist = {
    id: createId(),
    name: payload.name,
    genre: genre || null,
  };
  artistState = [artist, ...artistState];
  return artist;
}

export function updateArtist(id, payload) {
  let updated = null;
  const genre = typeof payload.genre === "string" ? payload.genre.trim() : payload.genre;

  artistState = artistState.map((artist) => {
    if (artist.id !== id) return artist;
    updated = {
      ...artist,
      name: payload.name,
      genre: genre || null,
    };
    return updated;
  });
  return updated;
}

export function deleteArtist(id) {
  const before = artistState.length;
  artistState = artistState.filter((artist) => artist.id !== id);
  return artistState.length < before;
}

export function resetArtists() {
  artistState = [...mockArtists];
}