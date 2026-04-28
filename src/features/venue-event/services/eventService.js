const STORAGE_KEY = "tiktaktuk_events";

export const getEvents = () => {
  const data = localStorage.getItem(STORAGE_KEY);

  if (data) {
    const parsed = JSON.parse(data);

    // 🔥 NORMALIZE DATA (ANTI NaN)
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
      venueName: "GBK Stadium",
      artist: "Coldplay",
      price: 1500000,
    },
    {
      id: 2,
      title: "The Weeknd Tour",
      venueName: "ICE BSD",
      artist: "The Weeknd",
      price: 1200000,
    },
  ];
};

export const saveEvents = (events) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
};