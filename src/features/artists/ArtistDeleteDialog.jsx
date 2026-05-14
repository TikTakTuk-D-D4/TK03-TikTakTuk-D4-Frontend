import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";

export function ArtistDeleteDialog({ open, onClose, artist, onConfirm }) {
  if (!artist) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Hapus Artis"
      subtitle="Periksa kembali data sebelum menghapus"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button variant="danger" onClick={() => onConfirm(artist)}>
            Hapus
          </Button>
        </>
      }
    >
      <p className="text-ink mb-2">
        Yakin ingin menghapus artis <strong>{artist.name}</strong>?
      </p>
      <p className="text-ink-mute font-mono text-xs">ID: {artist.id}</p>
      <p className="text-ink-mute text-xs mt-1">Tindakan ini tidak dapat dibatalkan.</p>
    </Modal>
  );
}
