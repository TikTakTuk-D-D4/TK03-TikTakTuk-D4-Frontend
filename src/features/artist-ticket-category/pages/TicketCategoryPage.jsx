import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../context/AuthContext";
import { TicketCategoryDeleteDialog } from "../../ticketCategories/TicketCategoryDeleteDialog";
import { TicketCategoryFormModal } from "../../ticketCategories/TicketCategoryFormModal";
import { TicketCategoryTable } from "../../ticketCategories/TicketCategoryTable";
import {
  createTicketCategory,
  deleteTicketCategory,
  getEvents,
  getTicketCategories,
  getVenues,
  updateTicketCategory,
} from "../services/ticketCategoryService";

function TicketCategoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const role = user?.role ?? "guest";
  const showActions = role === "administrator" || role === "organizer";

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    Promise.all([getTicketCategories(), getEvents(), getVenues()])
      .then(([cats, evts, vens]) => {
        setCategories(cats);
        setEvents(evts);
        setVenues(vens);
      })
      .finally(() => setLoading(false));
  }, []);

  const eventById = useMemo(() => new Map(events.map((item) => [item.id, item])), [events]);
  const venueById = useMemo(() => new Map(venues.map((item) => [item.id, item])), [venues]);

  const categoriesWithMeta = useMemo(() => {
    return categories
      .map((category) => {
        const eventItem = eventById.get(category.eventId);
        const venueItem = venueById.get(eventItem?.venueId);
        return {
          ...category,
          eventName: eventItem?.name || "-",
          organizerId: eventItem?.organizerId || "",
          venueCapacity: venueItem?.capacity || 0,
          venueName: venueItem?.name || "-",
        };
      })
      .sort((a, b) => {
        const eventNameCompare = a.eventName.localeCompare(b.eventName, "id-ID");
        if (eventNameCompare !== 0) return eventNameCompare;
        return a.name.localeCompare(b.name, "id-ID");
      });
  }, [categories, eventById, venueById]);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return categoriesWithMeta.filter((item) => {
      const passFilter = !eventFilter || item.eventId === eventFilter;
      const passSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.eventName.toLowerCase().includes(keyword);
      return passFilter && passSearch;
    });
  }, [categoriesWithMeta, search, eventFilter]);

  const visibleEventCount = useMemo(
    () => new Set(filteredCategories.map((item) => item.eventId)).size,
    [filteredCategories]
  );

  const canManageRow = (category) => {
    if (role === "administrator") return true;
    if (role === "organizer") return category.organizerId === user?.id;
    return false;
  };

  const refreshCategories = () => {
    getTicketCategories().then(setCategories);
  };

  const openCreateModal = () => {
    if (!showActions) return;
    if (role === "organizer") {
      const ownEvents = events.filter((e) => e.organizerId === user?.id);
      if (!ownEvents.length) {
        toast("Organizer ini belum memiliki event untuk dikelola.", "error");
        return;
      }
    }
    setFormMode("create");
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEditModal = (category) => {
    if (!canManageRow(category)) {
      toast("Anda tidak memiliki akses edit untuk kategori ini.", "error");
      return;
    }
    setFormMode("edit");
    setEditingCategory(category);
    setFormOpen(true);
  };

  const openDeleteDialog = (category) => {
    if (!canManageRow(category)) {
      toast("Anda tidak memiliki akses hapus untuk kategori ini.", "error");
      return;
    }
    setDeleteTarget(category);
  };

  const handleSubmit = async (payload) => {
    const selectedEvent = eventById.get(payload.eventId);
    if (role === "organizer" && selectedEvent?.organizerId !== user?.id) {
      toast("Organizer hanya boleh mengelola kategori untuk event miliknya.", "error");
      return false;
    }
    try {
      if (formMode === "edit" && editingCategory) {
        if (!canManageRow(editingCategory)) {
          toast("Anda tidak memiliki akses edit untuk kategori ini.", "error");
          return false;
        }
        await updateTicketCategory(editingCategory.id, payload);
        toast("Kategori diperbarui.", "success");
      } else {
        await createTicketCategory(payload);
        toast("Kategori ditambahkan.", "success");
      }
      refreshCategories();
      return true;
    } catch (err) {
      toast(err.message, "error");
      return false;
    }
  };

  const handleDelete = async (category) => {
    if (!canManageRow(category)) {
      toast("Anda tidak memiliki akses hapus untuk kategori ini.", "error");
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteTicketCategory(category.id);
      toast("Kategori dihapus.", "success");
      refreshCategories();
    } catch (err) {
      toast(err.message || "Kategori tiket gagal dihapus.", "error");
    }
    setDeleteTarget(null);
  };

  if (loading) return <section><p style={{ padding: "2rem" }}>Memuat data...</p></section>;

  return (
    <section>
      <PageHeader
        kicker={showActions ? "Manajemen" : "Direktori"}
        title="Kategori Tiket"
        subtitle={`${filteredCategories.length} kategori dari ${visibleEventCount} event.`}
        action={
          <div className="flex items-center gap-2.5">
            {showActions ? (
              <Button variant="primary" onClick={openCreateModal}>
                + Tambah Kategori Tiket
              </Button>
            ) : null}
          </div>
        }
      />

      <TicketCategoryTable
        categories={filteredCategories}
        events={events}
        showActions={showActions}
        canManageRow={canManageRow}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        search={search}
        onSearch={setSearch}
        eventFilter={eventFilter}
        onEventFilter={setEventFilter}
      />

      <TicketCategoryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        onSubmit={handleSubmit}
        category={editingCategory}
        categories={categoriesWithMeta}
        events={events}
        venues={venues}
        user={user}
      />

      <TicketCategoryDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        category={deleteTarget}
        onConfirm={handleDelete}
      />
    </section>
  );
}

export default TicketCategoryPage;
