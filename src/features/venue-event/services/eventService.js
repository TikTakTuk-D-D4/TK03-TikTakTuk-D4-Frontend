const STORAGE_KEY = "tiktaktuk_events";

export const getEvents = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    const parsed = JSON.parse(data);

    return parsed.map((e) => ({
      ...e,
      price:
        Number(e.price) ||
        Number(e.startPrice) ||
        (e.tickets?.length
          ? Math.min(...e.tickets.map((t) => Number(t.price) || 0))
          : 0),
    }));
  }

  return [
    {
      id: 1,
      title: "Coldplay Live Jakarta",
      date: "2026-06-12",
      time: "19:00",
      venueId: 1,
      venueName: "GBK Stadium",
      artist: "Coldplay",
      description: "Music of the Spheres World Tour in Jakarta.",
      ticketCategory: "VIP",
      stock: 500,
      price: 1500000,
    },
    {
      id: 2,
      title: "The Weeknd Tour",
      date: "2026-07-03",
      time: "20:00",
      venueId: 2,
      venueName: "ICE BSD",
      artist: "The Weeknd",
      description: "After Hours Til Dawn Tour Indonesia.",
      ticketCategory: "Gold",
      stock: 350,
      price: 1200000,
    },
    {
      id: 3,
      title: "NIKI Buzz World Tour",
      date: "2026-07-15",
      time: "19:30",
      venueId: 3,
      venueName: "JIExpo Kemayoran",
      artist: "NIKI",
      description: "Special concert for Indonesian fans.",
      ticketCategory: "Regular",
      stock: 700,
      price: 850000,
    },
    {
      id: 4,
      title: "Taylor Swift Tribute Night",
      date: "2026-08-01",
      time: "18:30",
      venueId: 4,
      venueName: "Istora Senayan",
      artist: "Tribute Artist",
      description: "Sing along to Taylor Swift greatest hits.",
      ticketCategory: "VIP",
      stock: 250,
      price: 950000,
    },
    {
      id: 5,
      title: "Arctic Monkeys Asia Tour",
      date: "2026-08-20",
      time: "20:00",
      venueId: 5,
      venueName: "Tennis Indoor Senayan",
      artist: "Arctic Monkeys",
      description: "Live performance in Jakarta.",
      ticketCategory: "Gold",
      stock: 300,
      price: 1100000,
    },
    {
      id: 6,
      title: "88rising Festival",
      date: "2026-09-05",
      time: "16:00",
      venueId: 6,
      venueName: "Beach City International Stadium",
      artist: "Rich Brian, NIKI, Joji",
      description: "Asian music festival by 88rising.",
      ticketCategory: "Regular",
      stock: 1000,
      price: 700000,
    },
    {
      id: 7,
      title: "LANY Jakarta Show",
      date: "2026-09-18",
      time: "19:00",
      venueId: 7,
      venueName: "Convention Hall SMESCO",
      artist: "LANY",
      description: "A beautiful night with LANY.",
      ticketCategory: "Gold",
      stock: 280,
      price: 980000,
    },
    {
      id: 8,
      title: "Summer Sound Fest",
      date: "2026-10-10",
      time: "15:00",
      venueId: 8,
      venueName: "Ecopark Ancol",
      artist: "Various Artists",
      description: "Outdoor summer music festival.",
      ticketCategory: "Regular",
      stock: 1200,
      price: 550000,
    },
  ];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};