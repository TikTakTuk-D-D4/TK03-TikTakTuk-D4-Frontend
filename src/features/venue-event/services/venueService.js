const STORAGE_KEY = "tiktaktuk_venues";

const DEFAULT_VENUES = [
  {
    id: 1,
    name: "GBK Stadium",
    city: "Jakarta",
    address: "Senayan",
    capacity: 80000,
    seatingType: "reserved",
  },
  {
    id: 2,
    name: "ICE BSD",
    city: "Tangerang",
    address: "BSD City",
    capacity: 50000,
    seatingType: "free",
  },
];

export const getVenues = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return DEFAULT_VENUES;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_VENUES));
  return DEFAULT_VENUES;
};

export const saveVenues = (venues) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(venues));
};