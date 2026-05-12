import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import PromotionTable from "../components/PromotionTable";
import PromotionFormModal from "../components/PromotionFormModal";
import DeletePromotionModal from "../components/DeletePromotionModal";
import { useAuth } from "../../../context/AuthContext";
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from "../services/promotionService";
import {
  PROMOTION_FILTER_OPTIONS,
} from "../constants/promotionConstants";
import {
  filterPromotions,
  getPromotionStats,
  getPromotionStatus,
  sortPromotions,
} from "../utils/promotionUtils";

function PromotionPage() {
  const { user } = useAuth();
  const currentRole = String(user?.role || "guest").toUpperCase();
  const isAdmin = currentRole === "ADMIN";

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPromotions()
      .then(setPromotions)
      .finally(() => setLoading(false));
  }, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!feedback) return undefined;

    const timer = window.setTimeout(() => setFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const visiblePromotions = useMemo(() => {
    const filtered = filterPromotions(promotions, {
      search: searchTerm,
      discountType: typeFilter,
    });

    return sortPromotions(filtered, "promoCode", "asc");
  }, [promotions, searchTerm, typeFilter]);

  const stats = useMemo(() => getPromotionStats(promotions), [promotions]);

  const statusCounts = useMemo(() => {
    return promotions.reduce(
      (accumulator, promotion) => {
        const status = getPromotionStatus(promotion);

        return {
          ...accumulator,
          [status]: (accumulator[status] || 0) + 1,
        };
      },
      {
        ACTIVE: 0,
        SCHEDULED: 0,
        EXPIRED: 0,
        EXHAUSTED: 0,
      }
    );
  }, [promotions]);

  const openCreateModal = () => {
    setFormMode("create");
    setSelectedPromotion(null);
    setIsFormOpen(true);
  };

  const openEditModal = (promotion) => {
    setFormMode("update");
    setSelectedPromotion(promotion);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setSelectedPromotion(null);
  };

  const refresh = () => getPromotions().then(setPromotions);

  const handleSubmitPromotion = async (promotion) => {
    try {
      if (formMode === "create") {
        const created = await createPromotion(promotion);
        setPromotions((prev) => [created, ...prev]);
        setFeedback({ type: "success", title: "Promo berhasil dibuat", description: `${created.promoCode} sudah masuk ke daftar promosi.` });
      } else {
        await updatePromotion(promotion.promotionId, promotion);
        await refresh();
        setFeedback({ type: "success", title: "Promo berhasil diperbarui", description: `${promotion.promoCode} sudah diperbarui.` });
      }
    } catch (err) {
      setFeedback({ type: "danger", title: "Gagal", description: err.message });
    }
    closeFormModal();
  };

  const handleDeletePromotion = async () => {
    if (!deleteTarget) return;
    try {
      await deletePromotion(deleteTarget.promotionId);
      setPromotions((prev) => prev.filter((item) => item.promotionId !== deleteTarget.promotionId));
      setFeedback({ type: "danger", title: "Promo berhasil dihapus", description: `${deleteTarget.promoCode} telah dihapus dari sistem.` });
    } catch (err) {
      setFeedback({ type: "danger", title: "Gagal menghapus", description: err.message });
    }
    setDeleteTarget(null);
  };

  if (loading) return <main className="min-h-screen bg-bg px-6 py-8 text-text"><p>Memuat data promosi...</p></main>;

  return (
    <main className="min-h-screen overflow-hidden bg-bg px-6 py-8 text-text">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute -left-20 top-8 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />

        <div className="relative z-10 space-y-8">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-primary/10 px-4 py-2 text-xs text-[#e7dcff]">
                <span className="font-mono uppercase tracking-[0.28em]">
                  Promo Control
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-muted">live discount inventory</span>
              </div>

              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.5em] text-accent">
                  TikTakTuk
                </p>
                <h1 className="mt-3 font-display text-4xl font-bold leading-tight md:text-5xl">
                  Manajemen{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Promosi
                  </span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted md:text-base">
                  Kelola kode promo dan kampanye diskon untuk pembelian tiket.
                  Admin dapat membuat, memperbarui, dan menghapus promosi,
                  sementara role lain tetap bisa memantau promo yang aktif.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={isAdmin ? "primary" : "secondary"}>
                  {isAdmin ? "Admin Access" : "Read Only"}
                </Badge>
                <Badge variant="secondary">
                  Role: {currentRole.toLowerCase()}
                </Badge>
                <Badge variant="secondary">
                  {statusCounts.ACTIVE} aktif / {statusCounts.SCHEDULED} terjadwal
                </Badge>
              </div>
            </div>

            {isAdmin && (
              <Button size="lg" onClick={openCreateModal}>
                + Buat Promo
              </Button>
            )}
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Total Promo"
              value={stats.totalPromo}
              hint="semua promo terdaftar"
            />
            <StatCard
              label="Total Penggunaan"
              value={`${stats.totalUsage}x`}
              hint="akumulasi pemakaian promo"
            />
            <StatCard
              label="Tipe Persentase"
              value={stats.totalPercentageType}
              hint="jumlah promo berbasis persen"
            />
          </section>

          <Card className="border-line-soft bg-surface/95 text-text shadow-soft">
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Daftar Promo
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Cari kode promo dan filter berdasarkan tipe diskon.
                  </p>
                </div>

                <div className="rounded-full border border-line-soft bg-white/[0.03] px-4 py-2 font-mono text-xs text-muted">
                  {visiblePromotions.length} item tampil
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <Input
                  placeholder="Cari kode promo..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="h-11 rounded-[10px] border border-line-soft bg-white/[0.02] px-4 text-sm text-text outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/20"
                >
                  {PROMOTION_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {feedback && (
                <div
                  className={`rounded-[14px] border px-4 py-3 text-sm ${
                    feedback.type === "danger"
                      ? "border-danger/35 bg-danger/10 text-danger"
                      : "border-ok/35 bg-ok/10 text-ok"
                  }`}
                >
                  <p className="font-semibold">{feedback.title}</p>
                  <p className="mt-1 text-current/90">{feedback.description}</p>
                </div>
              )}

              <PromotionTable
                promotions={visiblePromotions}
                isAdmin={isAdmin}
                onEdit={openEditModal}
                onDelete={setDeleteTarget}
                emptyMessage="Tidak ada promo yang cocok dengan filter saat ini."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {isFormOpen && (
        <PromotionFormModal
          key={`${formMode}-${selectedPromotion?.promotionId || "new"}`}
          isOpen={isFormOpen}
          mode={formMode}
          initialData={selectedPromotion}
          promotions={promotions}
          onClose={closeFormModal}
          onSubmit={handleSubmitPromotion}
        />
      )}

      <DeletePromotionModal
        isOpen={Boolean(deleteTarget)}
        promotion={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePromotion}
      />
    </main>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <Card className="relative overflow-hidden border-line-soft bg-surface-2 text-text shadow-soft">
      <div className="pointer-events-none absolute -right-10 -top-12 h-28 w-28 rounded-full bg-accent/18 blur-2xl" />
      <CardContent className="relative p-5">
        <p className="text-[11px] uppercase tracking-[0.6px] text-muted">
          {label}
        </p>
        <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-xs text-muted">{hint}</p>
      </CardContent>
    </Card>
  );
}

export default PromotionPage;
