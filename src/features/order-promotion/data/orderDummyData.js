import {
  PAYMENT_STATUS,
  SEATING_TYPE,
} from "../constants/orderConstants";

const orderDummyData = {
  currentEvent: {
    eventId: "evt_001",
    title: "Konser Melodi Senja",
    organizer: "Fourtwnty",
    venueName: "Jakarta Convention Center",
    venueCity: "Jakarta",
    eventDate: "2026-05-15",
    eventTime: "19:00",
    seatingType: SEATING_TYPE.RESERVED,
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  },

  ticketCategories: [
    {
      id: "cat_001",
      name: "WVIP",
      price: 1500000,
      quota: 50,
      sold: 20,
    },
    {
      id: "cat_002",
      name: "VIP",
      price: 750000,
      quota: 150,
      sold: 85,
    },
    {
      id: "cat_003",
      name: "Category 1",
      price: 450000,
      quota: 300,
      sold: 140,
    },
    {
      id: "cat_004",
      name: "Category 2",
      price: 250000,
      quota: 500,
      sold: 200,
    },
  ],

  availableSeats: [
    { id: "seat_001", section: "A", rowNumber: "A", seatNumber: "1", isAvailable: true },
    { id: "seat_002", section: "A", rowNumber: "A", seatNumber: "2", isAvailable: true },
    { id: "seat_003", section: "A", rowNumber: "A", seatNumber: "3", isAvailable: false },
    { id: "seat_004", section: "A", rowNumber: "A", seatNumber: "4", isAvailable: true },
    { id: "seat_005", section: "A", rowNumber: "B", seatNumber: "1", isAvailable: true },
    { id: "seat_006", section: "A", rowNumber: "B", seatNumber: "2", isAvailable: false },
    { id: "seat_007", section: "A", rowNumber: "B", seatNumber: "3", isAvailable: true },
    { id: "seat_008", section: "A", rowNumber: "B", seatNumber: "4", isAvailable: true },
    { id: "seat_009", section: "B", rowNumber: "C", seatNumber: "1", isAvailable: true },
    { id: "seat_010", section: "B", rowNumber: "C", seatNumber: "2", isAvailable: true },
    { id: "seat_011", section: "B", rowNumber: "C", seatNumber: "3", isAvailable: true },
    { id: "seat_012", section: "B", rowNumber: "C", seatNumber: "4", isAvailable: false },
  ],

  checkoutDefaults: {
    selectedCategoryId: "cat_004",
    quantity: 2,
    selectedSeatIds: ["seat_001", "seat_002"],
    appliedPromoCode: "",
    serviceFee: 0,
  },

  orders: [
    {
      id: "ord_001",
      orderDate: "2026-05-10T09:15:00",
      paymentStatus: PAYMENT_STATUS.PENDING,
      totalAmount: 500000,
      customerName: "Budi Santoso",
      eventTitle: "Konser Melodi Senja",
      itemCount: 2,
    },
    {
      id: "ord_002",
      orderDate: "2026-05-09T15:40:00",
      paymentStatus: PAYMENT_STATUS.PAID,
      totalAmount: 1500000,
      customerName: "Siti Rahayu",
      eventTitle: "Festival Seni Budaya",
      itemCount: 2,
    },
    {
      id: "ord_003",
      orderDate: "2026-05-08T20:10:00",
      paymentStatus: PAYMENT_STATUS.CANCELLED,
      totalAmount: 750000,
      customerName: "Andi Wijaya",
      eventTitle: "Jazz Night Jakarta",
      itemCount: 1,
    },
    {
      id: "ord_004",
      orderDate: "2026-05-08T10:05:00",
      paymentStatus: PAYMENT_STATUS.PAID,
      totalAmount: 450000,
      customerName: "Maya Putri",
      eventTitle: "Rock Legends Tour",
      itemCount: 1,
    },
  ],
};

export default orderDummyData;
