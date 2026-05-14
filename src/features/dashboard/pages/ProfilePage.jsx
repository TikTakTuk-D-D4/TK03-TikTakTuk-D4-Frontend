import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPageUser, updateCurrentUser, updateUserPassword, updateProfile } from "../../auth/services/authService";

function isValidEmail(value) {
  return /.+@.+\..+/.test(value);
}

function getDisplayName(user) {
  return user?.full_name || user?.organizer_name || user?.name || user?.username || "User";
}

function getRoleLabel(role) {
  if (role === "admin") return "Administrator";
  if (role === "organizer") return "Organizer";
  return "Pelanggan";
}

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getPageUser());
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editMessage, setEditMessage] = useState("");
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    const handleUserUpdate = (e) => setUser(e?.detail || getPageUser());
    window.addEventListener("tiktaktuk:user", handleUserUpdate);
    return () => window.removeEventListener("tiktaktuk:user", handleUserUpdate);
  }, []);

  const role = user?.role;
  const isCustomer = role === "customer";
  const isOrganizer = role === "organizer";
  const canEdit = isCustomer || isOrganizer;
  const displayName = getDisplayName(user);
  const roleLabel = getRoleLabel(role);
  const initial = displayName.charAt(0).toUpperCase();

  const openEdit = () => {
    setEditErrors({});
    setEditMessage("");
    setEditForm({
      full_name: user?.full_name || user?.name || "",
      phone_number: user?.phone_number || "",
      organizer_name: user?.organizer_name || user?.name || "",
      contact_email: user?.contact_email || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditErrors({});
    setEditMessage("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (isCustomer) {
      if (!editForm.full_name.trim()) nextErrors.full_name = "Nama lengkap wajib diisi.";
      if (!editForm.phone_number.trim()) nextErrors.phone_number = "Nomor telepon wajib diisi.";
    }
    if (isOrganizer) {
      if (!editForm.organizer_name.trim()) nextErrors.organizer_name = "Nama organizer wajib diisi.";
      if (!editForm.contact_email.trim()) nextErrors.contact_email = "Email kontak wajib diisi.";
      else if (!isValidEmail(editForm.contact_email.trim())) nextErrors.contact_email = "Format email tidak valid.";
    }

    if (Object.keys(nextErrors).length) { setEditErrors(nextErrors); return; }

    try {
      const updated = await updateProfile({
        user_id: user?.user_id,
        full_name: editForm.full_name?.trim(),
        phone_number: editForm.phone_number?.trim(),
        organizer_name: editForm.organizer_name?.trim(),
        contact_email: editForm.contact_email?.trim(),
      });
      setUser(updated);
      setEditMessage("Profil berhasil diperbarui.");
      setEditErrors({});
      setTimeout(() => { closeEdit(); }, 1200);
    } catch (err) {
      setEditErrors({ form: err.message || "Gagal memperbarui profil." });
    }
  };

  const handlePwSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!pwForm.current_password) nextErrors.current_password = "Password lama wajib diisi.";
    if (!pwForm.new_password) nextErrors.new_password = "Password baru wajib diisi.";
    else if (pwForm.new_password.length < 6) nextErrors.new_password = "Password minimal 6 karakter.";
    if (!pwForm.confirm_password) nextErrors.confirm_password = "Konfirmasi password wajib diisi.";
    else if (pwForm.confirm_password !== pwForm.new_password) nextErrors.confirm_password = "Konfirmasi tidak cocok.";
    if (pwForm.current_password && pwForm.new_password && pwForm.current_password === pwForm.new_password)
      nextErrors.new_password = "Password baru harus berbeda dari password lama.";

    if (Object.keys(nextErrors).length) { setPwErrors(nextErrors); return; }

    const result = updateUserPassword({ currentPassword: pwForm.current_password, nextPassword: pwForm.new_password });
    if (!result.ok) { setPwErrors({ form: result.error || "Gagal mengubah password." }); return; }

    setUser(result.user);
    setPwErrors({});
    setPwMessage("Password berhasil diubah.");
    setPwForm({ current_password: "", new_password: "", confirm_password: "" });
  };

  return (
    <div className="page profile-page">
      <div className="profile-page-header">
        <div className="profile-page-header-top">
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => navigate(-1)}>
            ← Kembali
          </button>
        </div>
        <h1>Profil Saya</h1>
        <p className="helper-text">Kelola informasi pribadi dan preferensi akun Anda</p>
      </div>

      {/* Informasi Profil */}
      <div className="profile-section-card">
        <div className="profile-section-head">
          <div>
            <strong>Informasi Profil</strong>
            <p className="helper-text">Kelola data pribadi Anda di platform TikTakTuk</p>
          </div>
          {canEdit && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={openEdit}>
              ✏ Edit
            </button>
          )}
        </div>

        <div className="profile-avatar-row">
          <div className="profile-avatar-lg">{initial}</div>
        </div>

        <div className="profile-info-block">
          <div className="profile-info-label">Role / Peran</div>
          <span className="chip role-chip">{roleLabel}</span>
        </div>

        <div className="profile-info-grid">
          {isCustomer && (
            <>
              <div className="profile-info-item">
                <span className="profile-info-label">Nama Lengkap</span>
                <strong>{user?.full_name || user?.name || "-"}</strong>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Nomor Telepon</span>
                <strong>{user?.phone_number || "-"}</strong>
              </div>
            </>
          )}
          {isOrganizer && (
            <>
              <div className="profile-info-item">
                <span className="profile-info-label">Nama Organizer</span>
                <strong>{user?.organizer_name || user?.name || "-"}</strong>
              </div>
              <div className="profile-info-item">
                <span className="profile-info-label">Email Kontak</span>
                <strong>{user?.contact_email || "-"}</strong>
              </div>
            </>
          )}
          {!isCustomer && !isOrganizer && (
            <div className="profile-info-item">
              <span className="profile-info-label">Nama</span>
              <strong>{user?.name || "-"}</strong>
            </div>
          )}
          <div className="profile-info-item">
            <span className="profile-info-label">Username</span>
            <strong>@{user?.username || "-"}</strong>
          </div>
        </div>
      </div>

      {/* Update Password */}
      <div className="profile-section-card">
        <div className="profile-section-head">
          <div>
            <strong>🔒 Update Password</strong>
            <p className="helper-text">Perbarui password Anda untuk menjaga keamanan akun</p>
          </div>
        </div>

        <form className="form-section" onSubmit={handlePwSubmit}>
          <label>
            Password Lama
            <input
              type="password"
              placeholder="Password Lama"
              value={pwForm.current_password}
              onChange={(e) => setPwForm((f) => ({ ...f, current_password: e.target.value }))}
            />
            {pwErrors.current_password && <span className="form-error">{pwErrors.current_password}</span>}
          </label>

          <label>
            Password Baru
            <input
              type="password"
              placeholder="Password Baru"
              value={pwForm.new_password}
              onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
            />
            {pwErrors.new_password && <span className="form-error">{pwErrors.new_password}</span>}
          </label>

          <label>
            Konfirmasi Password Baru
            <input
              type="password"
              placeholder="Konfirmasi Password Baru"
              value={pwForm.confirm_password}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
            />
            {pwErrors.confirm_password && <span className="form-error">{pwErrors.confirm_password}</span>}
          </label>

          {pwErrors.form && <span className="form-error">{pwErrors.form}</span>}
          {pwMessage && <span className="hint" style={{ color: "var(--success, #22c55e)" }}>{pwMessage}</span>}

          <div className="profile-pw-actions">
            <button className="btn btn-ghost" type="button" onClick={() => { setPwForm({ current_password: "", new_password: "", confirm_password: "" }); setPwErrors({}); setPwMessage(""); }}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit">
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profil</h3>
              <button className="modal-close" type="button" onClick={closeEdit}>×</button>
            </div>
            <form className="form-section" id="edit-profile-form" onSubmit={handleEditSubmit}>
              <label>
                Username
                <input type="text" value={user?.username || ""} disabled />
                <span className="hint">Username tidak dapat diubah.</span>
              </label>

              {isCustomer && (
                <>
                  <label>
                    Nama Lengkap
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                    />
                    {editErrors.full_name && <span className="form-error">{editErrors.full_name}</span>}
                  </label>
                  <label>
                    No. Telepon
                    <input
                      type="text"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm((f) => ({ ...f, phone_number: e.target.value }))}
                    />
                    {editErrors.phone_number && <span className="form-error">{editErrors.phone_number}</span>}
                  </label>
                </>
              )}

              {isOrganizer && (
                <>
                  <label>
                    Nama Organizer
                    <input
                      type="text"
                      value={editForm.organizer_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, organizer_name: e.target.value }))}
                    />
                    {editErrors.organizer_name && <span className="form-error">{editErrors.organizer_name}</span>}
                  </label>
                  <label>
                    Email Kontak
                    <input
                      type="email"
                      value={editForm.contact_email}
                      onChange={(e) => setEditForm((f) => ({ ...f, contact_email: e.target.value }))}
                    />
                    {editErrors.contact_email && <span className="form-error">{editErrors.contact_email}</span>}
                  </label>
                </>
              )}

              {editErrors.form && <span className="form-error">{editErrors.form}</span>}
              {editMessage && <span className="hint" style={{ color: "var(--success, #22c55e)" }}>{editMessage}</span>}
            </form>
            <div className="modal-footer">
              <button className="btn btn-ghost" type="button" onClick={closeEdit}>Batal</button>
              <button className="btn btn-primary" type="submit" form="edit-profile-form">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
