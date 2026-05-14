import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

export function TicketCategoryDeleteDialog({ open, onClose, category, onConfirm }) {
  if (!category) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hapus Kategori"
      subtitle="Periksa data kategori sebelum dihapus"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="danger" onClick={() => onConfirm(category)}>
            Hapus
          </Button>
        </>
      }
    >
      <p className="text-ink mb-2">
        Yakin ingin menghapus kategori <strong>{category.name}</strong>?
      </p>
      <p className="text-ink-mute font-mono text-xs mt-2">ID: {category.id}</p>
      <p className="text-ink-mute text-xs mt-1">Tindakan ini tidak dapat dibatalkan.</p>
    </Modal>
  );
}
