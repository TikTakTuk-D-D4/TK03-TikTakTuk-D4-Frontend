import { getTicketCategories } from "../services/ticketCategoryService";

function TicketCategoryPage() {
  const categories = getTicketCategories();

  return (
    <div className="page">
      <h1>Ticket Category Page</h1>
      <div className="grid">
        {categories.map((category) => (
          <div className="card" key={category.id}>
            <h3>{category.name}</h3>
            <p>Event: {category.eventName}</p>
            <p>Quota: {category.quota}</p>
            <p>Price: Rp {category.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TicketCategoryPage;