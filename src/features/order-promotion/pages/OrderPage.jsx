import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";

import TicketCategoryList from "../components/TicketCategoryList";
import QuantitySelector from "../components/QuantitySelector";
import SeatPicker from "../components/SeatPicker";
import PromoCodeForm from "../components/PromoCodeForm";
import OrderSummaryCard from "../components/OrderSummaryCard";
import OrderTable from "../components/OrderTable";
import UpdateOrderModal from "../components/UpdateOrderModal";

import { getOrders, createOrder, updateOrder, deleteOrder as deleteOrderApi } from "../services/orderService";
import { getPromotions } from "../services/promotionService";
import { getEvents } from "../../venue-event/services/eventService";
import { getTicketCategories } from "../../artist-ticket-category/services/ticketCategoryService";

import {
  PAYMENT_STATUS,
  ORDER_FILTER_OPTIONS,
} from "../constants/orderConstants";

import {
  calculateOrderTotal,
  formatCurrency,
  validateSeatSelection,
  validateTicketQuantity,
} from "../utils/orderUtils";

export default function OrderPage() {
  const { user } = useAuth();
  const role = (user?.role || "customer").toUpperCase();

  const [orders, setOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [events, setEvents] = useState([]);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);

  useEffect(() => {
    Promise.all([getOrders(), getPromotions(), getEvents()])
      .then(([ordersData, promoData, eventsData]) => {
        setOrders(ordersData);
        setPromotions(promoData);
        setEvents(eventsData);
        if (eventsData.length > 0) setSelectedEventId(eventsData[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedEventId) { setTicketCategories([]); return; }
    getTicketCategories(selectedEventId).then(setTicketCategories);
  }, [selectedEventId]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const isReservedSeating = false;

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;
  const selectedCategory = ticketCategories.find((c) => c.id === selectedCategoryId) || null;

  const orderTotal = calculateOrderTotal({
    price: selectedCategory?.price || 0,
    quantity,
    promo: appliedPromo,
    serviceFee: 5000,
  });

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (role === "CUSTOMER") {
          return order.customer_id === user?.customer_id;
        }
        return true;
      })
      .filter((order) => {
        const matchesSearch =
          !searchTerm ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "ALL" || order.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders, role, searchTerm, statusFilter, user?.customer_id]);

  const stats = useMemo(() => {
    const totalOrder = visibleOrders.length;
    const paidOrder = visibleOrders.filter(
      (order) => order.paymentStatus === PAYMENT_STATUS.PAID
    ).length;
    const pendingOrder = visibleOrders.filter(
      (order) => order.paymentStatus === PAYMENT_STATUS.PENDING
    ).length;
    const totalRevenue = visibleOrders
      .filter((order) => order.paymentStatus === PAYMENT_STATUS.PAID)
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return { totalOrder, paidOrder, pendingOrder, totalRevenue };
  }, [visibleOrders]);

  const handleCheckout = async () => {
    const quantityValidation = validateTicketQuantity(quantity);
    if (!quantityValidation.isValid) { alert(quantityValidation.message); return; }

    const seatValidation = validateSeatSelection({ selectedSeats: selectedSeatIds, quantity, isReservedSeating });
    if (!seatValidation.isValid) { alert(seatValidation.message); return; }

    try {
      const newOrder = await createOrder({
        customer_id: user?.customer_id || null,
        total_amount: orderTotal.total,
        payment_status: "Pending",
        promotion_id: appliedPromo?.promotionId || null,
      });
      setOrders((prev) => [newOrder, ...prev]);
    } catch (err) {
      alert(err.message);
    }
  };

  const openUpdateModal = (order) => { setSelectedOrder(order); setIsUpdateOpen(true); };
  const closeUpdateModal = () => { setSelectedOrder(null); setIsUpdateOpen(false); };

  const handleUpdateOrder = async (updatedOrder) => {
    try {
      const saved = await updateOrder(updatedOrder.id, updatedOrder);
      setOrders((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
    } catch (err) {
      alert(err.message);
    }
    closeUpdateModal();
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await deleteOrderApi(orderToDelete.id);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
    } catch (err) {
      alert(err.message);
    }
    setOrderToDelete(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg px-6 py-8 text-text">
        <p>Memuat data order...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto max-w-7xl space-y-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-accent">
              Order Management
            </p>
            <h1 className="mt-2 font-display text-3xl font-bold text-text">
              Order Page
            </h1>
            <p className="mt-2 text-sm text-muted">
              Checkout, daftar order, dan pengelolaan order sesuai role.
            </p>
          </div>

        </header>

        {role === "CUSTOMER" && (
          <section className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1 space-y-6">
              {events.length > 0 && (
                <Card className="border-line-soft bg-surface text-text shadow-soft">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-primary text-xl shadow-glow">
                        ♫
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-display text-lg font-semibold">
                          {selectedEvent?.title || "Pilih Event"}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{selectedEvent?.venueName || "-"}</Badge>
                        </div>
                        <p className="mt-2 text-xs text-muted">
                          {selectedEvent?.date} · {selectedEvent?.time}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-muted">Pilih Event</label>
                      <select
                        value={selectedEventId || ""}
                        onChange={(e) => {
                          setSelectedEventId(e.target.value);
                          setSelectedCategoryId(null);
                          setSelectedSeatIds([]);
                        }}
                        className="w-full h-10 rounded-[10px] border border-line-soft bg-white/[0.02] px-3 text-sm text-text outline-none focus:border-accent focus:ring-4 focus:ring-accent/20"
                      >
                        {events.map((ev) => (
                          <option key={ev.id} value={ev.id}>
                            {ev.title || ev.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {ticketCategories.length > 0 && (
                <TicketCategoryList
                  categories={ticketCategories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={(category) => {
                    setSelectedCategoryId(category.id);
                    setSelectedSeatIds([]);
                  }}
                />
              )}

              <div className="flex flex-col gap-6 md:flex-row">
                <QuantitySelector
                  value={quantity}
                  min={1}
                  max={10}
                  className="md:flex-1"
                  onChange={(nextQuantity) => {
                    setQuantity(nextQuantity);
                    setSelectedSeatIds((prev) =>
                      prev.slice(0, Number(nextQuantity) || 0)
                    );
                  }}
                />

                {isReservedSeating && (
                  <Card className="border-line-soft bg-surface text-text shadow-soft md:flex-1">
                    <CardContent className="p-5">
                      <SeatPicker
                        seats={[]}
                        selectedSeatIds={selectedSeatIds}
                        maxSelection={Number(quantity) || 1}
                        onChange={setSelectedSeatIds}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>

              <Card className="border-line-soft bg-surface text-text shadow-soft">
                <CardContent className="p-5">
                  <PromoCodeForm
                    promotions={promotions}
                    appliedPromo={appliedPromo}
                    onApply={setAppliedPromo}
                    onRemove={() => setAppliedPromo(null)}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="xl:sticky xl:top-6 xl:w-[360px] xl:shrink-0 xl:self-start">
              <OrderSummaryCard
                price={selectedCategory?.price || 0}
                quantity={Number(quantity) || 0}
                promo={appliedPromo}
                serviceFee={5000}
                onCheckout={handleCheckout}
              />
            </div>
          </section>
        )}

        <section className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-semibold text-text">
              Daftar Order
            </h2>
            <p className="mt-1 text-sm text-muted">
              {role === "CUSTOMER" && "Riwayat pembelian tiket Anda"}
              {role === "ORGANIZER" && "Order dari event yang Anda selenggarakan"}
              {role === "ADMIN" && "Semua order yang terdaftar di sistem"}
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <StatCard label="Total Order" value={stats.totalOrder} className="md:flex-1" />
            <StatCard label="Lunas" value={stats.paidOrder} className="md:flex-1" />
            <StatCard label="Pending" value={stats.pendingOrder} className="md:flex-1" />
            {role !== "CUSTOMER" && (
              <StatCard
                label="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                className="md:flex-1"
              />
            )}
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <Input
              placeholder={
                role === "CUSTOMER"
                  ? "Cari order ID..."
                  : "Cari ID atau pelanggan..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-[10px] border border-line-soft bg-white/[0.02] px-3 text-sm text-text outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 md:w-48"
            >
              {ORDER_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <OrderTable
            orders={visibleOrders}
            role={role}
            isAdmin={role === "ADMIN"}
            onEdit={openUpdateModal}
            onDelete={setOrderToDelete}
          />
        </section>
      </div>

      {isUpdateOpen && selectedOrder && (
        <UpdateOrderModal
          key={selectedOrder.id}
          isOpen={isUpdateOpen}
          order={selectedOrder}
          onClose={closeUpdateModal}
          onSubmit={handleUpdateOrder}
        />
      )}

      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] border border-line bg-surface p-6 text-text shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-danger">
                  Hapus Order
                </h3>
                <p className="mt-2 text-sm text-muted">
                  Apakah Anda yakin ingin menghapus catatan order ini? Tindakan
                  ini tidak dapat dibatalkan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="text-muted hover:text-text"
              >
                ×
              </button>
            </div>

            <p className="mt-4 font-mono text-xs text-accent">
              {orderToDelete.id}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOrderToDelete(null)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteOrder}>
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value, className = "" }) {
  return (
    <Card
      className={`relative overflow-hidden border-line-soft bg-surface-2 text-text shadow-soft ${className}`}
    >
      <CardContent className="p-5">
        <p className="text-[11px] uppercase tracking-[0.6px] text-muted">
          {label}
        </p>
        <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
