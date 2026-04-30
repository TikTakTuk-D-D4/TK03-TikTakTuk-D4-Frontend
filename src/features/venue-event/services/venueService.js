const STORAGE_KEY = "tiktaktuk_venues";

const DEFAULT_VENUES = [
  {
    id: 1,
    name: "GBK Stadium",
    city: "Jakarta",
    address: "Senayan, Jakarta Pusat",
    capacity: 80000,
    seatingType: "reserved",
  },
  {
    id: 2,
    name: "ICE BSD",
    city: "Tangerang",
    address: "BSD City, Tangerang",
    capacity: 50000,
    seatingType: "free",
  },
  {
    id: 3,
    name: "JIExpo Kemayoran",
    city: "Jakarta",
    address: "Kemayoran, Jakarta Utara",
    capacity: 35000,
    seatingType: "reserved",
  },
  {
    id: 4,
    name: "Istora Senayan",
    city: "Jakarta",
    address: "Gelora Bung Karno, Senayan",
    capacity: 9000,
    seatingType: "reserved",
  },
  {
    id: 5,
    name: "Tennis Indoor Senayan",
    city: "Jakarta",
    address: "Senayan, Jakarta Selatan",
    capacity: 5200,
    seatingType: "reserved",
  },
  {
    id: 6,
    name: "Beach City International Stadium",
    city: "Jakarta",
    address: "Ancol, Jakarta Utara",
    capacity: 16000,
    seatingType: "free",
  },
  {
    id: 7,
    name: "Convention Hall SMESCO",
    city: "Jakarta",
    address: "Gatot Subroto, Jakarta Selatan",
    capacity: 3000,
    seatingType: "reserved",
  },
  {
    id: 8,
    name: "Ecopark Ancol",
    city: "Jakarta",
    address: "Ancol, Jakarta Utara",
    capacity: 12000,
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