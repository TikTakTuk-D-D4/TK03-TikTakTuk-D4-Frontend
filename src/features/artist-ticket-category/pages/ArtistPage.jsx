import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { PageHeader } from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../context/AuthContext";
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

  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingArtist, setEditingArtist] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    getArtists()
      .then(setArtists)
      .finally(() => setLoading(false));
  }, []);

  const sortedArtists = useMemo(
    () => [...artists].sort((a, b) => a.name?.localeCompare(b.name, "id-ID")),
    [artists]
  );

  const refresh = () => getArtists().then(setArtists);
  const canManage = role === "admin";

  const openCreateForm = () => {
    setEditingArtist(null);
    setFormOpen(true);
  };

  const openEditForm = (artist) => {
    setEditingArtist(artist);
    setFormOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editingArtist) {
        await updateArtist(editingArtist.id, payload);
        toast("Artis diperbarui.", "success");
      } else {
        await createArtist(payload);
        toast("Artis ditambahkan.", "success");
      }
      await refresh();
      return true;
    } catch (err) {
      toast(err.message || "Gagal menyimpan artis.", "error");
      return false;
    }
  };

  const handleDelete = async (artist) => {
    try {
      await deleteArtist(artist.id);
      toast("Artis dihapus.", "success");
      await refresh();
    } catch (err) {
      toast(err.message || "Artis gagal dihapus.", "error");
    }
    setDeleteTarget(null);
  };

  if (role === "guest") return <Navigate to="/login" replace />;
  if (loading) return <section><p style={{ padding: "2rem" }}>Memuat data artis...</p></section>;

  return (
    <section>
      <PageHeader
        kicker={canManage ? "Manajemen" : "Direktori"}
        title={canManage ? "Daftar Artis" : "Artis"}
        subtitle={
          canManage
            ? `${artists.length} artis terdaftar.`
            : "Eksplor line-up dari berbagai konser."
        }
        action={
          <div className="flex items-center gap-2.5">
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
