import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Modal } from "../../../components/ui/Modal";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Table, Td, Th, Tr } from "../../../components/ui/Table";
import { IconButton } from "../../../components/ui/IconButton";
import { useToast } from "../../../components/ui/Toast";
import { useAuth } from "../../../context/AuthContext";
import { getEventById } from "../services/eventService";
import {
  getArtists,
  getArtistsByEvent,
  addArtistToEvent,
  removeArtistFromEvent,
} from "../../artist-ticket-category/services/artistService";

const ROLE_OPTIONS = ["Performer", "Guest Star", "Opening Act", "Host", "DJ"];

function AddArtistModal({ open, onClose, onSubmit, allArtists }) {
  const [artistId, setArtistId] = useState("");
  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setArtistId("");
    setRole("");
    setErrors({});
  }, [open]);

  const validate = () => {
    const errs = {};
    if (!artistId) errs.artistId = "Pilih artis terlebih dahulu.";
    if (!role.trim()) errs.role = "Role wajib diisi.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const ok = await onSubmit(artistId, role.trim());
    setLoading(false);
    if (ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah Artist ke Event"
      subtitle="Pilih artist dan tentukan perannya dalam event ini"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Tambah"}
          </Button>
        </>
      }
    >
      <Field label="Artist" error={errors.artistId}>
        <Select
          value={artistId}
          onChange={(e) => {
            setArtistId(e.target.value);
            setErrors((prev) => ({ ...prev, artistId: "" }));
          }}
          error={errors.artistId}
        >
          <option value="">-- Pilih Artist --</option>
          {allArtists.map((a) => (
            <option key={a.artist_id} value={a.artist_id}>
              {a.name}{a.genre ? ` (${a.genre})` : ""}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Role" error={errors.role} hint="Peran artist dalam event ini.">
        <Input
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setErrors((prev) => ({ ...prev, role: "" }));
          }}
          error={errors.role}
          placeholder="Contoh: Performer"
          list="role-suggestions"
        />
        <datalist id="role-suggestions">
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </Field>
    </Modal>
  );
}

function EventArtistPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [event, setEvent] = useState(null);
  const [eventArtists, setEventArtists] = useState([]);
  const [allArtists, setAllArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const canManage =
    user?.role === "admin" ||
    user?.role === "administrator" ||
    user?.role === "organizer";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getEventById(eventId),
      getArtistsByEvent(eventId),
      getArtists(),
    ])
      .then(([eventData, artistsInEvent, allArtistsData]) => {
        setEvent(eventData);
        setEventArtists(Array.isArray(artistsInEvent) ? artistsInEvent : []);
        setAllArtists(Array.isArray(allArtistsData) ? allArtistsData : []);
      })
      .catch(() => toast("Gagal memuat data.", "error"))
      .finally(() => setLoading(false));
  }, [eventId]);

  const refresh = () =>
    getArtistsByEvent(eventId).then((data) =>
      setEventArtists(Array.isArray(data) ? data : [])
    );

  const handleAdd = async (artistId, role) => {
    try {
      await addArtistToEvent(eventId, artistId, role);
      toast("Artist berhasil ditambahkan ke event.", "success");
      await refresh();
      return true;
    } catch (err) {
      toast(err.message || "Gagal menambahkan artist.", "error");
      return false;
    }
  };

  const handleRemove = async (artistId, artistName) => {
    if (!confirm(`Hapus "${artistName}" dari event ini?`)) return;
    try {
      await removeArtistFromEvent(eventId, artistId);
      toast(`"${artistName}" dihapus dari event.`, "success");
      await refresh();
    } catch (err) {
      toast(err.message || "Gagal menghapus artist.", "error");
    }
  };

  if (loading) {
    return (
      <section>
        <p style={{ padding: "2rem" }}>Memuat data artist event...</p>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        kicker="Manajemen Event"
        title={`Artist: ${event?.title || eventId}`}
        subtitle={`${eventArtists.length} artist terdaftar dalam event ini.`}
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              onClick={() => navigate("/events")}
            >
              <ArrowLeft size={15} className="mr-1" />
              Kembali
            </Button>
            {canManage && (
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                + Tambah Artist
              </Button>
            )}
          </div>
        }
      />

      {eventArtists.length === 0 ? (
        <div className="bg-card border border-edge rounded p-8 text-center text-ink-dim">
          Belum ada artist yang terdaftar di event ini.
          {canManage && (
            <span>
              {" "}Klik <strong>"+ Tambah Artist"</strong> untuk menambahkan.
            </span>
          )}
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Nama Artist</Th>
              <Th>Genre</Th>
              <Th>Role dalam Event</Th>
              {canManage && <Th className="w-24">Action</Th>}
            </tr>
          </thead>
          <tbody>
            {eventArtists.map((ea) => (
              <Tr key={ea.artist_id}>
                <Td>
                  <strong>{ea.name}</strong>
                </Td>
                <Td>
                  {ea.genre ? (
                    <span className="chip-primary">{ea.genre}</span>
                  ) : (
                    <span className="text-ink-mute text-xs">-</span>
                  )}
                </Td>
                <Td>{ea.role || "-"}</Td>
                {canManage && (
                  <Td>
                    <IconButton
                      danger
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRemove(ea.artist_id, ea.name)}
                    />
                  </Td>
                )}
              </Tr>
            ))}
          </tbody>
        </Table>
      )}

      <AddArtistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        allArtists={allArtists}
      />
    </section>
  );
}

export default EventArtistPage;
