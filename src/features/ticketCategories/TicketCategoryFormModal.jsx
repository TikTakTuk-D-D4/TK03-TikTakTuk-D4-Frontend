import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";

const MAX_NAME = 50;

function byRoleEvents(events, user) {
  if (user?.role === "organizer") {
    return events.filter((eventItem) => eventItem.organizerId === user.organizer_id);
  }
  return events;
}

function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

function isNonNegative(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0;
}

export function TicketCategoryFormModal({
  open,
  onClose,
  mode,
  onSubmit,
  category,
  categories,
  events,
  venues,
  user,
}) {
  const [form, setForm] = useState({
    eventId: "",
    name: "",
    quota: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  const allowedEvents = useMemo(() => byRoleEvents(events, user), [events, user]);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit && category) {
      setForm({
        eventId: category.eventId,
        name: category.name,
        quota: String(category.quota),
        price: String(category.price),
      });
    } else {
      setForm({
        eventId: allowedEvents[0]?.id || "",
        name: "",
        quota: "",
        price: "",
      });
    }

    setErrors({});
  }, [open, isEdit, category, allowedEvents]);

  const selectedEvent = events.find((eventItem) => eventItem.id === form.eventId);
  const selectedVenue = venues.find((venueItem) => venueItem.id === selectedEvent?.venueId);

  const validate = () => {
    const nextErrors = {};
    const trimmedName = form.name.trim();

    if (!form.eventId) {
      nextErrors.eventId = "Event wajib dipilih.";
    }

    if (!trimmedName) {
      nextErrors.name = "Nama kategori wajib diisi.";
    } else if (trimmedName.length > MAX_NAME) {
      nextErrors.name = "Nama kategori maksimal 50 karakter.";
    }

    if (!isPositiveInteger(form.quota)) {
      nextErrors.quota = "Kuota harus bilangan bulat positif (> 0).";
    }

    if (!isNonNegative(form.price)) {
      nextErrors.price = "Harga harus bilangan tidak negatif (>= 0).";
    }

    if (!nextErrors.quota && selectedVenue) {
      const existingTotal = categories
        .filter((item) => item.eventId === form.eventId && (!isEdit || item.id !== category.id))
        .reduce((sum, item) => sum + Number(item.quota), 0);

      const nextQuota = Number(form.quota);
      const nextTotal = existingTotal + nextQuota;

      if (nextTotal > selectedVenue.capacity) {
        nextErrors.quota = `Total kuota seluruh kategori pada event ini akan menjadi ${nextTotal}, melebihi kapasitas venue (${selectedVenue.capacity}). Sisa kapasitas: ${selectedVenue.capacity - existingTotal}.`;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const ok = onSubmit({
      eventId: form.eventId,
      name: form.name.trim(),
      quota: Number(form.quota),
      price: Number(form.price),
    });

    if (ok) onClose();
  };

  const eventLabel = events.find((item) => item.id === form.eventId)?.name || "-";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Kategori" : "Tambah Kategori Tiket"}
      subtitle={
        isEdit
          ? "Perbarui nama kategori, kuota, dan harga."
          : "Lengkapi event, nama kategori, harga, dan kuota."
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Simpan
          </Button>
        </>
      }
      size="lg"
    >
      {isEdit ? (
        <Field label="Event">
          <div className="px-3.5 py-2.5 bg-bg-soft border border-edge rounded-[10px] text-ink-dim cursor-not-allowed">
            {eventLabel}
          </div>
        </Field>
      ) : (
        <Field label="Event" error={errors.eventId}>
          <Select
            value={form.eventId}
            onChange={(event) => handleChange("eventId", event.target.value)}
            error={errors.eventId}
          >
            <option value="">Pilih event</option>
            {allowedEvents.map((eventItem) => (
              <option key={eventItem.id} value={eventItem.id}>
                {eventItem.name}
              </option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Nama Kategori" error={errors.name}>
        <Input
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          error={errors.name}
          maxLength={MAX_NAME}
          placeholder="Contoh: VIP"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Harga" error={errors.price}>
          <Input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => handleChange("price", event.target.value)}
            error={errors.price}
            placeholder="Contoh: 1500000"
          />
        </Field>

        <Field
          label="Kuota"
          error={errors.quota}
          hint={
            selectedVenue
              ? `Kapasitas venue: ${Number(selectedVenue.capacity).toLocaleString("id-ID")}`
              : "Isi dengan bilangan bulat positif."
          }
        >
          <Input
            type="number"
            min="1"
            step="1"
            value={form.quota}
            onChange={(event) => handleChange("quota", event.target.value)}
            error={errors.quota}
            placeholder="Contoh: 300"
          />
        </Field>
      </div>
    </Modal>
  );
}
