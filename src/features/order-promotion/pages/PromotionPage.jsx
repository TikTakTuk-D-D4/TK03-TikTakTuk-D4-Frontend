import { getPromotions } from "../services/promotionService";

function PromotionPage() {
  const promotions = getPromotions();

  return (
    <div className="page">
      <h1>Promotion Page</h1>
      <div className="grid">
        {promotions.map((promo) => (
          <div className="card" key={promo.id}>
            <h3>{promo.code}</h3>
            <p>Type: {promo.discountType}</p>
            <p>Value: {promo.discountValue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PromotionPage;