export const ORDER_PROMOTION_EVENTS = [
  {
    id: "81000000-0000-0000-0000-000000000001",
    title: "Konser Melodi Senja",
    venueName: "Jakarta Convention Center",
    date: "15 Mei 2026",
    time: "19.00 WIB",
  },
];

export const ORDER_PROMOTION_TICKET_CATEGORIES = {
  "81000000-0000-0000-0000-000000000001": [
    {
      id: "aa000000-0000-0000-0000-000000000001",
      name: "VIP",
      price: 750000,
      quota: 150,
      sold: 2,
    },
    {
      id: "aa000000-0000-0000-0000-000000000002",
      name: "Category 1",
      price: 450000,
      quota: 300,
      sold: 0,
    },
  ],
};

export const ORDER_PROMOTION_PROMOTIONS = [
  {
    promotionId: "92000000-0000-0000-0000-000000000001",
    promoCode: "WELCOME50",
    discountType: "NOMINAL",
    discountValue: 50000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1000,
    usedCount: 0,
  },
  {
    promotionId: "92000000-0000-0000-0000-000000000002",
    promoCode: "NEON10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1000,
    usedCount: 0,
  },
  {
    promotionId: "92000000-0000-0000-0000-000000000003",
    promoCode: "HEMAT20",
    discountType: "PERCENTAGE",
    discountValue: 20,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1000,
    usedCount: 0,
  },
  {
    promotionId: "92000000-0000-0000-0000-000000000004",
    promoCode: "FEST10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 1000,
    usedCount: 0,
  },
];
