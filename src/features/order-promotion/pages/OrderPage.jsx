import React, { useMemo, useState } from "react";
import { getPageUser } from "../../auth/services/authService";

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

import orderDummyData from "../data/orderDummyData";
import promotionDummyData from "../data/promotionDummyData";

import {
  PAYMENT_STATUS,
  ORDER_FILTER_OPTIONS,
  SEATING_TYPE,
} from "../constants/orderConstants";

import {
  calculateOrderTotal,
  formatCurrency,
  validateSeatSelection,
  validateTicketQuantity,
} from "../utils/orderUtils";

export default function OrderPage() {
  const [role, setRole] = useState(() => {
    const loggedIn = getPageUser();
    return (loggedIn?.role || "customer").toUpperCase();
  });

  const [orders, setOrders] = useState(orderDummyData.orders);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    orderDummyData.checkoutDefaults.selectedCategoryId
  );
  const [quantity, setQuantity] = useState(orderDummyData.checkoutDefaults.quantity);
  const [selectedSeatIds, setSelectedSeatIds] = useState(
    orderDummyData.checkoutDefaults.selectedSeatIds || []
  );
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);

  const event = orderDummyData.currentEvent;
  const isReservedSeating = event.seatingType === SEATING_TYPE.RESERVED;

  const selectedCategory = useMemo(() => {
    return orderDummyData.ticketCategories.find(
      (category) => category.id === selectedCategoryId
    );
  }, [selectedCategoryId]);

  const orderTotal = calculateOrderTotal({
    price: selectedCategory?.price || 0,
    quantity,
    promo: appliedPromo,
    serviceFee: orderDummyData.checkoutDefaults.serviceFee,
  });

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (role === "CUSTOMER") {
          return order.customerName === "Budi Santoso";
        }

        if (role === "ORGANIZER") {
          return order.eventTitle === "Konser Melodi Senja";
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
  }, [orders, role, searchTerm, statusFilter]);

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

    return {
      totalOrder,
      paidOrder,
      pendingOrder,
      totalRevenue,
    };
  }, [visibleOrders]);

  const handleCheckout = () => {
    const quantityValidation = validateTicketQuantity(quantity);
    if (!quantityValidation.isValid) {
      alert(quantityValidation.message);
      return;
    }

    const seatValidation = validateSeatSelection({
      selectedSeats: selectedSeatIds,
      quantity,
      isReservedSeating,
    });

    if (!seatValidation.isValid) {
      alert(seatValidation.message);
      return;
    }

    const newOrder = {
      id: `ord_${String(orders.length + 1).padStart(3, "0")}`,
      orderDate: new Date().toISOString(),
      paymentStatus: PAYMENT_STATUS.PENDING,
      totalAmount: orderTotal.total,
      customerName: "Budi Santoso",
      eventTitle: event.title,
      itemCount: quantity,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRole("CUSTOMER");
  };

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setIsUpdateOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedOrder(null);
    setIsUpdateOpen(false);
  };

  const handleUpdateOrder = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
    closeUpdateModal();
  };

  const handleDeleteOrder = () => {
    if (!deleteOrder) return;

    setOrders((prev) => prev.filter((order) => order.id !== deleteOrder.id));
    setDeleteOrder(null);
  };

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

          <div className="inline-flex rounded-full border border-line-soft bg-white/[0.04] p-1">
            {["CUSTOMER", "ORGANIZER", "ADMIN"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  role === item
                    ? "bg-primary text-white shadow-glow"
                    : "text-muted hover:bg-white/[0.05] hover:text-text"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        {role === "CUSTOMER" && (
          <section className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1 space-y-6">
              <Card className="border-line-soft bg-surface text-text shadow-soft">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] bg-primary text-xl shadow-glow">
                    ♫
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-semibold">
                      {event.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="primary">{event.organizer}</Badge>
                      <Badge variant="secondary">{event.venueCity}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {event.eventDate} · {event.eventTime} · {event.venueName}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <TicketCategoryList
                categories={orderDummyData.ticketCategories}
                selectedCategoryId={selectedCategoryId}
                onSelect={(category) => {
                  setSelectedCategoryId(category.id);
                  setSelectedSeatIds([]);
                }}
              />

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
                        seats={orderDummyData.availableSeats}
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
                    promotions={promotionDummyData}
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
                serviceFee={orderDummyData.checkoutDefaults.serviceFee}
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
            <StatCard
              label="Total Order"
              value={stats.totalOrder}
              className="md:flex-1"
            />
            <StatCard
              label="Lunas"
              value={stats.paidOrder}
              className="md:flex-1"
            />
            <StatCard
              label="Pending"
              value={stats.pendingOrder}
              className="md:flex-1"
            />
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
            onDelete={setDeleteOrder}
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

      {deleteOrder && (
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
                onClick={() => setDeleteOrder(null)}
                className="text-muted hover:text-text"
              >
                ×
              </button>
            </div>

            <p className="mt-4 font-mono text-xs text-accent">
              {deleteOrder.id}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeleteOrder(null)}>
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
