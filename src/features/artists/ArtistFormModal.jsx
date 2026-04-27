import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

const MAX_LEN = 100;

export function ArtistFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({ name: "", genre: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm({
      name: initialData?.name || "",
      genre: initialData?.genre || "",
    });
    setErrors({});
  }, [open, initialData]);

  const isEdit = Boolean(initialData);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    const name = form.name.trim();
    const genre = form.genre.trim();

    if (!name) {
      nextErrors.name = "Nama artis wajib diisi.";
    } else if (name.length > MAX_LEN) {
      nextErrors.name = "Nama artis maksimal 100 karakter.";
    }

    if (genre.length > MAX_LEN) {
      nextErrors.genre = "Genre maksimal 100 karakter.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const ok = onSubmit({
      name: form.name.trim(),
      genre: form.genre.trim() || null,
    });

    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Artis" : "Tambah Artis"}
      subtitle={isEdit ? "Perbarui data artis terpilih" : "Masukkan data artis baru"}
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
    >
      <Field label="Nama" error={errors.name}>
        <Input
          value={form.name}
          onChange={(event) => handleChange("name", event.target.value)}
          error={errors.name}
          placeholder="Contoh: Tulus"
          maxLength={MAX_LEN}
        />
      </Field>

      <Field label="Genre" error={errors.genre} hint="Opsional, maksimal 100 karakter.">
        <Input
          value={form.genre}
          onChange={(event) => handleChange("genre", event.target.value)}
          error={errors.genre}
          placeholder="Contoh: Pop"
          maxLength={MAX_LEN}
        />
      </Field>
    </Modal>
  );
}
