import { DISCOUNT_TYPE } from "../constants/promotionConstants";

const promotionDummyData = [
  {
    promotionId: "promo_001",
    promoCode: "TIKTAK20",
    discountType: DISCOUNT_TYPE.PERCENTAGE,
    discountValue: 20,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    usageLimit: 100,
    usedCount: 43,
  },
  {
    promotionId: "promo_002",
    promoCode: "HEMAT50K",
    discountType: DISCOUNT_TYPE.NOMINAL,
    discountValue: 50000,
    startDate: "2026-05-01",
    endDate: "2026-05-20",
    usageLimit: 50,
    usedCount: 12,
  },
  {
    promotionId: "promo_003",
    promoCode: "NEWUSER30",
    discountType: DISCOUNT_TYPE.PERCENTAGE,
    discountValue: 30,
    startDate: "2026-05-12",
    endDate: "2026-06-12",
    usageLimit: 200,
    usedCount: 0,
  },
  {
    promotionId: "promo_004",
    promoCode: "FLASH25",
    discountType: DISCOUNT_TYPE.PERCENTAGE,
    discountValue: 25,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    usageLimit: 75,
    usedCount: 61,
  },
  {
    promotionId: "promo_005",
    promoCode: "DISC100K",
    discountType: DISCOUNT_TYPE.NOMINAL,
    discountValue: 100000,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    usageLimit: 10,
    usedCount: 10,
  },
];

export default promotionDummyData;
