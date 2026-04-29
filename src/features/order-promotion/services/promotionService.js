import promotionDummyData from "../data/promotionDummyData";

export function getPromotions() {
  return promotionDummyData.map((promotion) => ({ ...promotion }));
}
