import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../context/AuthContext";
import { RoleSwitcher } from "../components/RoleSwitcher";
import { ArtistDeleteDialog } from "../../artists/ArtistDeleteDialog";
import { ArtistDirectoryGrid } from "../../artists/ArtistDirectoryGrid";
import { ArtistFormModal } from "../../artists/ArtistFormModal";
import { ArtistManagementTable } from "../../artists/ArtistManagementTable";
import {
  createArtist,
  deleteArtist,
  getArtists,
  updateArtist,
} from "../services/artistService";

function ArtistPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const role = user?.role ?? "guest";

  const [artists, setArtists] = useState(() => getArtists());
  const [formOpen, setFormOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sortedArtists = useMemo(() => {
    return [...artists].sort((a, b) => a.name.localeCompare(b.name, "id-ID"));
  }, [artists]);

  const refresh = () => setArtists(getArtists());
  const canManage = role === "admin";
  const headerKicker = canManage ? "Manajemen" : "Direktori";
  const headerTitle = canManage ? "Daftar Artis" : "Artis";
  const headerSubtitle = canManage
    ? `${artists.length} artis terdaftar.`
    : "Eksplor line-up dari berbagai konser.";

  const openCreateForm = () => {
    setEditingArtist(null);
    setFormOpen(true);
  };

  const openEditForm = (artist) => {
    setEditingArtist(artist);
    setFormOpen(true);
  };

  const handleSubmit = (payload) => {
    if (editingArtist) {
      const updated = updateArtist(editingArtist.id, payload);
      if (!updated) {
        toast("Gagal memperbarui artis.", "error");
        return false;
      }
      toast("Artis diperbarui.", "success");
    } else {
      createArtist(payload);
      toast("Artis ditambahkan.", "success");
    }

    refresh();
    return true;
  };

  const handleDelete = (artist) => {
    const ok = deleteArtist(artist.id);
    if (ok) {
      toast("Artis dihapus.", "success");
      refresh();
    } else {
      toast("Artis gagal dihapus.", "error");
    }

    setDeleteTarget(null);
  };

  if (role === "guest") {
    return <Navigate to="/login" replace />;
  }

  return (
    <section>
      <PageHeader
        kicker={headerKicker}
        title={headerTitle}
        subtitle={headerSubtitle}
        action={
          <div className="flex items-center gap-2.5">
            <RoleSwitcher />
            {canManage ? (
              <Button variant="primary" onClick={openCreateForm}>
                + Tambah Artis
              </Button>
            ) : null}
          </div>
        }
      />

      {canManage ? (
        <ArtistManagementTable
          artists={sortedArtists}
          onEdit={openEditForm}
          onDelete={(artist) => setDeleteTarget(artist)}
        />
      ) : (
        <>
          <div className="mb-4 px-4 py-3 rounded-[10px] border border-edge bg-bg-soft text-sm text-ink-dim">
            Anda berada pada mode pembacaan data artist.
          </div>
          <ArtistDirectoryGrid artists={sortedArtists} />
        </>
      )}

      <ArtistFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingArtist}
      />

      <ArtistDeleteDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        artist={deleteTarget}
        onConfirm={handleDelete}
      />
    </section>
  );
}

export default ArtistPage;