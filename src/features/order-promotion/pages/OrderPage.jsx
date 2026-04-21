import { getOrders } from "../services/orderService";

function OrderPage() {
  const orders = getOrders();

  return (
    <div className="page">
      <h1>Order Page</h1>
      <div className="grid">
        {orders.map((order) => (
          <div className="card" key={order.id}>
            <h3>{order.id}</h3>
            <p>Status: {order.paymentStatus}</p>
            <p>Total: Rp {order.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderPage;