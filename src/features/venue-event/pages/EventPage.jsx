import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents, deleteEvent } from "../services/eventService";
import { getVenues } from "../services/venueService";
import { useAuth } from "../../../context/AuthContext";
import { getTicketCategories } from "../../artist-ticket-category/services/ticketCategoryService";
import { createOrder } from "../../order-promotion/services/orderService";
import { getPromotionByCode } from "../../order-promotion/services/promotionService";
import { normalizePromoCode } from "../../order-promotion/utils/promotionUtils";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

const currencyFormat = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function EventPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [venueFilter, setVenueFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketCategories, setTicketCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  useEffect(() => {
    Promise.all([getEvents(), getVenues()])
      .then(([eventsData, venuesData]) => {
        setEvents(eventsData);
        setVenues(venuesData);
      })
      .finally(() => setLoading(false));
  }, []);

  const canManage = user?.role === "admin" || user?.role === "organizer";

  const selectedCategory = useMemo(
    () => ticketCategories.find((category) => category.id === selectedCategoryId) || null,
    [ticketCategories, selectedCategoryId]
  );

  const estimatedTotal = useMemo(
    () => Number(selectedCategory?.price || 0) * Math.max(Number(quantity) || 0, 0),
    [selectedCategory, quantity]
  );

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;

    const subtotal = Number(estimatedTotal) || 0;
    if (String(appliedPromo.discountType || "").toUpperCase() === "PERCENTAGE") {
      return Math.min(subtotal * (Number(appliedPromo.discountValue || 0) / 100), subtotal);
    }

    return Math.min(Number(appliedPromo.discountValue || 0), subtotal);
  }, [appliedPromo, estimatedTotal]);

  const finalTotal = useMemo(
    () => Math.max(Number(estimatedTotal || 0) - Number(discountAmount || 0), 0),
    [discountAmount, estimatedTotal]
  );

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !search ||
      (event.title || event.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesVenue = !venueFilter || event.venueId === venueFilter;
    return matchesSearch && matchesVenue;
  });

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus event ini?")) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message || "Gagal menghapus event.");
    }
  };

  const openCheckout = async (eventItem) => {
    setCheckoutLoading(true);
    setCheckoutError("");
    setPromoCode("");
    setAppliedPromo(null);
    setPromoMessage(null);
    setCheckoutOpen(true);
    setSelectedEvent(eventItem);
    setSelectedCategoryId("");
    setQuantity(1);
    try {
      const categories = await getTicketCategories(eventItem.id);
      setTicketCategories(categories);
    } catch (err) {
      setCheckoutError(err.message || "Gagal memuat kategori tiket.");
      setTicketCategories([]);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutError("");
    setTicketCategories([]);
    setSelectedCategoryId("");
    setSelectedEvent(null);
    setQuantity(1);
    setPromoCode("");
    setAppliedPromo(null);
    setPromoMessage(null);
    setApplyingPromo(false);
  };

  const handlePromoCodeChange = (event) => {
    const nextCode = event.target.value;
    setPromoCode(nextCode);

    if (promoMessage) {
      setPromoMessage(null);
    }

    if (appliedPromo && normalizePromoCode(nextCode) !== appliedPromo.promoCode) {
      setAppliedPromo(null);
    }
  };

  const handleApplyPromo = async () => {
    const normalizedCode = normalizePromoCode(promoCode);

    if (!normalizedCode) {
      setPromoMessage({ type: "danger", text: "Kode promo wajib diisi." });
      setAppliedPromo(null);
      return;
    }

    setApplyingPromo(true);
    setPromoMessage(null);

    try {
      const promo = await getPromotionByCode(normalizedCode);
      const now = new Date();
      const startDate = promo.startDate ? new Date(promo.startDate) : null;
      const endDate = promo.endDate ? new Date(promo.endDate) : null;
      const usageLimit = Number(promo.usageLimit || 0);
      const usedCount = Number(promo.usedCount || 0);

      if (startDate && now < startDate) {
        throw new Error("Promo belum dapat digunakan.");
      }

      if (endDate && now > endDate) {
        throw new Error("Promo sudah berakhir.");
      }

      if (usageLimit > 0 && usedCount >= usageLimit) {
        throw new Error("Kuota promo sudah habis.");
      }

      setAppliedPromo(promo);
      setPromoCode(promo.promoCode);
      setPromoMessage({ type: "success", text: `${promo.promoCode} diterapkan.` });
    } catch (err) {
      setAppliedPromo(null);
      setPromoMessage({
        type: "danger",
        text: err.message || "Kode promo tidak dapat digunakan.",
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode("");
    setAppliedPromo(null);
    setPromoMessage(null);
  };

  const handleCheckout = async () => {
    if (!user?.customer_id) {
      setCheckoutError("Akun customer tidak valid untuk membuat pesanan.");
      return;
    }

    if (!selectedEvent?.id) {
      setCheckoutError("Event belum dipilih.");
      return;
    }

    if (!selectedCategoryId) {
      setCheckoutError("Pilih kategori tiket terlebih dahulu.");
      return;
    }

    const safeQuantity = Math.max(Number(quantity) || 0, 1);

    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      await createOrder(
        {
          customer_id: user.customer_id,
          event_id: selectedEvent.id,
          category_id: selectedCategoryId,
          quantity: safeQuantity,
          seat_ids: [],
          promo_code: appliedPromo?.promoCode,
          total_amount: finalTotal,
        },
        user
      );

      closeCheckout();
      navigate("/orders", {
        state: {
          refreshOrders: true,
          flashMessage: "Pesanan berhasil dibuat dan masuk ke daftar Pesanan.",
        },
      });
    } catch (err) {
      setCheckoutError(err.message || "Gagal membuat pesanan.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="page"><p>Memuat data event...</p></div>;

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">Events</h1>

      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="Search event..."
          className="px-3 py-2 rounded bg-gray-800"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-3 py-2 rounded bg-gray-800"
          value={venueFilter}
          onChange={(e) => setVenueFilter(e.target.value)}
        >
          <option value="">All Venue</option>
          {venues.map((venue) => (
            <option key={venue.id} value={venue.id}>
              {venue.name}
            </option>
          ))}
        </select>

        {canManage && (
          <button
            onClick={() => navigate("/events/create")}
            className="bg-pink-500 px-4 py-2 rounded"
          >
            + Buat Event
          </button>
        )}
      </div>

      <div className="grid">
        {filteredEvents.map((event) => (
          <div className="card" key={event.id}>
            <h3>{event.title || event.name}</h3>
            <p>📍 {event.venueName || "-"}</p>
            <p>
              📅 {event.date} {event.time && `⏰ ${event.time}`}
            </p>
            <p>{event.description}</p>

            {!canManage && (
              <button
                onClick={() => openCheckout(event)}
                className="bg-green-500 px-4 py-2 rounded mt-2"
              >
                Beli Tiket
              </button>
            )}

            {canManage && (
              <div className="flex gap-2 mt-3">
                <button onClick={() => navigate(`/events/edit/${event.id}`)}>
                  Edit
                </button>
                <button onClick={() => navigate(`/events/${event.id}/artists`)}>
                  Kelola Artist
                </button>
                <button onClick={() => handleDelete(event.id)}>
                  Hapus
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <p className="text-muted">Tidak ada event yang ditemukan.</p>
        )}
      </div>

      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border-line-soft bg-surface text-text shadow-glow">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.5em] text-accent">Checkout</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-text">
                    {selectedEvent?.title || selectedEvent?.name || "Beli Tiket"}
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    Pilih kategori tiket dan jumlah pembelian. Pesanan akan langsung masuk ke halaman Pesanan Anda.
                  </p>
                </div>
                <button type="button" onClick={closeCheckout} className="text-xl leading-none text-muted transition hover:text-text">
                  ×
                </button>
              </div>

              {checkoutError ? (
                <div className="rounded-[14px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {checkoutError}
                </div>
              ) : null}

              <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-[16px] border border-line-soft bg-surface-2 p-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted">Event</p>
                    <h4 className="mt-2 font-display text-lg font-semibold text-text">
                      {selectedEvent?.title || selectedEvent?.name}
                    </h4>
                    <p className="mt-2 text-sm text-muted">
                      {selectedEvent?.venueName || "-"} · {selectedEvent?.date || "-"} {selectedEvent?.time || ""}
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-line-soft bg-surface p-4">
                    <p className="text-[11px] uppercase tracking-[0.5em] text-accent">Kategori Tiket</p>
                    <div className="mt-4 space-y-3">
                      {checkoutLoading && ticketCategories.length === 0 ? (
                        <div className="rounded-[14px] border border-dashed border-line-soft bg-white/[0.02] p-5 text-sm text-muted">
                          Memuat kategori tiket...
                        </div>
                      ) : ticketCategories.length === 0 ? (
                        <div className="rounded-[14px] border border-dashed border-line-soft bg-white/[0.02] p-5 text-sm text-muted">
                          Belum ada kategori tiket tersedia untuk event ini.
                        </div>
                      ) : (
                        ticketCategories.map((category) => {
                          const isSelected = selectedCategoryId === category.id;
                          return (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setSelectedCategoryId(category.id)}
                              className={`w-full rounded-[14px] border px-4 py-4 text-left transition ${
                                isSelected
                                  ? "border-accent bg-primary/10 shadow-glow"
                                  : "border-line-soft bg-surface-2 hover:border-line hover:bg-white/[0.03]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <h5 className="font-semibold text-text">{category.name}</h5>
                                  <p className="mt-1 text-xs text-muted">
                                    Sisa kuota: {category.sisa_kuota}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-display text-lg font-semibold text-text">
                                    {currencyFormat.format(category.price)}
                                  </div>
                                  <div className="text-xs text-muted">per tiket</div>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-[16px] border border-line-soft bg-surface-2 p-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.5em] text-accent">Ringkasan Pesanan</p>
                    <h4 className="mt-2 font-display text-lg font-semibold text-text">Detail Pembelian</h4>
                  </div>

                  <label className="block text-sm text-muted">
                    Jumlah tiket
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      className="mt-2"
                    />
                  </label>

                  <div className="rounded-[14px] border border-line-soft bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">Kode Promo</p>
                        <p className="mt-1 text-xs text-muted">
                          Gunakan promo aktif untuk mendapatkan potongan harga.
                        </p>
                      </div>
                      {appliedPromo ? (
                        <span className="rounded-full border border-ok/25 bg-ok/10 px-3 py-1 text-[11px] font-medium text-ok">
                          {appliedPromo.promoCode} diterapkan
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <Input
                        placeholder="Masukkan kode promo"
                        value={promoCode}
                        onChange={handlePromoCodeChange}
                        className="uppercase"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleApplyPromo}
                        disabled={applyingPromo || !promoCode.trim()}
                        className="border border-line-soft bg-white/[0.03] hover:border-line hover:bg-white/[0.07]"
                      >
                        {applyingPromo ? "Memeriksa..." : "Terapkan"}
                      </Button>
                    </div>

                    {promoMessage ? (
                      <p
                        className={`mt-3 text-xs ${
                          promoMessage.type === "danger" ? "text-danger" : "text-ok"
                        }`}
                      >
                        {promoMessage.text}
                      </p>
                    ) : null}

                    {appliedPromo ? (
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        className="mt-3 text-xs font-medium text-muted transition hover:text-danger"
                      >
                        Hapus promo
                      </button>
                    ) : null}
                  </div>

                  <div className="rounded-[14px] border border-line-soft bg-surface p-4">
                    <div className="flex items-center justify-between text-sm text-muted">
                      <span>Kategori</span>
                      <span>{selectedCategory?.name || "-"}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted">
                      <span>Harga satuan</span>
                      <span>{currencyFormat.format(selectedCategory?.price || 0)}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-muted">
                      <span>Jumlah</span>
                      <span>{Math.max(Number(quantity) || 0, 0)}</span>
                    </div>
                    {appliedPromo ? (
                      <div className="mt-3 flex items-center justify-between text-sm text-ok">
                        <span>Diskon</span>
                        <span>- {currencyFormat.format(discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="mt-4 border-t border-line-soft pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-text">Total</span>
                        <span className="font-display text-xl font-bold text-text">
                          {currencyFormat.format(finalTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={closeCheckout} className="flex-1 border border-line-soft bg-white/[0.03] hover:border-line hover:bg-white/[0.07]">
                      Batal
                    </Button>
                    <Button onClick={handleCheckout} disabled={checkoutLoading || !selectedCategoryId} className="flex-1">
                      {checkoutLoading ? "Memproses..." : "Buat Pesanan"}
                    </Button>
                  </div>

                  <p className="text-xs leading-5 text-muted">
                    Status pesanan akan dibuat sebagai <strong className="text-text">Pending</strong> dan langsung muncul di halaman Pesanan Anda.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default EventPage;
