import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { useAuth } from "../../../context/AuthContext";
import EmptyOrderState from "../components/EmptyOrderState";
import OrderTable from "../components/OrderTable";
import UpdateOrderModal from "../components/UpdateOrderModal";
import { ORDER_FILTER_OPTIONS, PAYMENT_STATUS } from "../constants/orderConstants";
import { getOrders, updateOrder, deleteOrder as deleteOrderApi } from "../services/orderService";
import { formatCurrency } from "../utils/orderUtils";

function normalizeRole(role) {
  const normalized = String(role || "customer").toUpperCase();
  if (normalized === "ADMINISTRATOR") return "ADMIN";
  return normalized;
}

function getPageCopy(role) {
  if (role === "ADMIN") {
    return {
      eyebrow: "Order Control",
      title: "Semua Order",
      description: "Pantau seluruh order tiket, status pembayaran, dan tindak lanjut admin dari satu dashboard.",
    };
  }

  if (role === "ORGANIZER") {
    return {
      eyebrow: "Order Control",
      title: "Order Event Anda",
      description: "Lihat order yang masuk untuk event yang Anda selenggarakan, terurut dari yang terbaru.",
    };
  }

  return {
    eyebrow: "Pesanan Saya",
    title: "Riwayat Pesanan",
    description: "Pantau pembelian tiket Anda, cek status pembayaran, dan telusuri transaksi terbaru.",
  };
}

function StatCard({ label, value, helper, className = "" }) {
  return (
    <Card className={`border-line-soft bg-surface-2 text-text shadow-soft ${className}`}>
      <CardContent className="p-5">
        <p className="text-[11px] uppercase tracking-[0.5em] text-muted">{label}</p>
        <p className="mt-3 font-display text-2xl font-semibold text-text">{value}</p>
        {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className="border-line-soft bg-surface text-text shadow-soft">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-full animate-pulse rounded-[14px] bg-white/[0.04]" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-28 animate-pulse rounded-[16px] bg-white/[0.04]" />
            <div className="h-28 animate-pulse rounded-[16px] bg-white/[0.04]" />
            <div className="h-28 animate-pulse rounded-[16px] bg-white/[0.04]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <Card className="border-red-400/25 bg-surface text-text shadow-soft">
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-red-300">Order Error</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-text">Data order belum bisa dimuat</h2>
          <p className="mt-2 text-sm text-muted">{message || "Terjadi gangguan saat mengambil data order."}</p>
        </div>
        <Button variant="ghost" onClick={onRetry} className="border border-red-400/25 text-red-200 hover:border-red-300 hover:text-white">
          Coba Lagi
        </Button>
      </CardContent>
    </Card>
  );
}

export default function OrderPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const copy = getPageCopy(role);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [flashMessage, setFlashMessage] = useState("");

  useEffect(() => {
    if (!flashMessage) return undefined;
    const timeoutId = window.setTimeout(() => setFlashMessage(""), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [flashMessage]);

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const ordersData = await getOrders(user);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || "Gagal memuat order.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [user?.user_id, user?.role, user?.customer_id, user?.organizer_id]);

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const matchesSearch =
          !searchTerm || order.id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "ALL" || order.paymentStatus === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
  }, [orders, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalOrder = visibleOrders.length;
    const paidOrder = visibleOrders.filter((order) => order.paymentStatus === PAYMENT_STATUS.PAID).length;
    const pendingOrder = visibleOrders.filter((order) => order.paymentStatus === PAYMENT_STATUS.PENDING).length;
    const totalRevenue = visibleOrders
      .filter((order) => order.paymentStatus === PAYMENT_STATUS.PAID)
      .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

    return { totalOrder, paidOrder, pendingOrder, totalRevenue };
  }, [visibleOrders]);

  const openUpdateModal = (order) => {
    setSelectedOrder(order);
    setIsUpdateOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedOrder(null);
    setIsUpdateOpen(false);
  };

  async function handleUpdateOrder(updatedOrder) {
    setIsSaving(true);
    try {
      const saved = await updateOrder(updatedOrder.id, updatedOrder, user);
      setOrders((prev) => prev.map((order) => (order.id === saved.id ? { ...order, ...saved } : order)));
      setFlashMessage("Status pembayaran berhasil diperbarui.");
      closeUpdateModal();
    } catch (err) {
      setFlashMessage(err.message || "Gagal mengubah order.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteOrder() {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrderApi(orderToDelete.id, user);
      setOrders((prev) => prev.filter((order) => order.id !== orderToDelete.id));
      setFlashMessage("Order berhasil dihapus.");
      setOrderToDelete(null);
    } catch (err) {
      setFlashMessage(err.message || "Gagal menghapus order.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg px-6 py-8 text-text">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-accent">{copy.eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-bold text-text">{copy.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{copy.description}</p>
          </div>
          <Badge variant="secondary" className="font-mono text-[11px] uppercase tracking-[0.3em]">
            {role}
          </Badge>
        </header>

        {flashMessage ? (
          <Card className="border-line-soft bg-surface text-text shadow-soft">
            <CardContent className="p-4 text-sm text-muted">{flashMessage}</CardContent>
          </Card>
        ) : null}

        {loading ? <LoadingState /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={loadOrders} /> : null}

        {!loading && !error ? (
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Order" value={stats.totalOrder} helper="Sesuai filter aktif" />
              <StatCard label="Lunas" value={stats.paidOrder} helper="Pembayaran berhasil" />
              <StatCard label="Pending" value={stats.pendingOrder} helper="Menunggu konfirmasi" />
              {role !== "CUSTOMER" ? (
                <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} helper="Akumulasi order lunas" />
              ) : null}
            </div>

            <Card className="border-line-soft bg-surface text-text shadow-soft">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 md:flex-row">
                  <Input
                    placeholder="Cari berdasarkan Order ID..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-11 rounded-[10px] border border-line-soft bg-white/[0.02] px-3 text-sm text-text outline-none focus:border-accent focus:ring-4 focus:ring-accent/20 md:w-56"
                  >
                    {ORDER_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} className="bg-surface text-text">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-muted">
                  Urutan order selalu berdasarkan tanggal terbaru. Gunakan pencarian Order ID dan filter status untuk mempersempit daftar.
                </p>
              </CardContent>
            </Card>

            {visibleOrders.length === 0 ? (
              <EmptyOrderState role={role} />
            ) : (
              <OrderTable
                orders={visibleOrders}
                isAdmin={role === "ADMIN"}
                onEdit={openUpdateModal}
                onDelete={setOrderToDelete}
              />
            )}
          </section>
        ) : null}
      </div>

      {isUpdateOpen && selectedOrder ? (
        <UpdateOrderModal
          key={selectedOrder.id}
          isOpen={isUpdateOpen}
          order={selectedOrder}
          onClose={closeUpdateModal}
          onSubmit={handleUpdateOrder}
          isLoading={isSaving}
        />
      ) : null}

      {orderToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[18px] border border-line bg-surface p-6 text-text shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-danger">Hapus Order</h3>
                <p className="mt-2 text-sm text-muted">
                  Apakah Anda yakin ingin menghapus catatan order ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <button type="button" onClick={() => setOrderToDelete(null)} className="text-muted hover:text-text">
                ×
              </button>
            </div>

            <p className="mt-4 font-mono text-xs text-accent">{orderToDelete.id}</p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setOrderToDelete(null)} disabled={isDeleting}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleDeleteOrder} disabled={isDeleting}>
                {isDeleting ? "Menghapus..." : "Hapus"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
