# Artists Module (TK03)

## Tujuan
Modul ini menangani manajemen data artist dengan pembagian akses berbasis role:

- `admin`: full CRUD artist
- `organizer`: read-only artist directory
- `customer`: read-only artist directory
- `guest`: tidak dapat mengakses halaman artist (redirect ke login)

## Struktur
- `ArtistManagementTable.jsx`: tabel admin dengan aksi edit/delete.
- `ArtistDirectoryGrid.jsx`: tampilan kartu read-only.
- `ArtistFormModal.jsx`: form tambah/edit dengan validasi.
- `ArtistDeleteDialog.jsx`: konfirmasi hapus data.

## Sumber Data
Data diproses in-memory via service:

- `src/features/artist-ticket-category/services/artistService.js`
- Seed awal di `src/data/mockArtists.js`

## Aturan Validasi
- `name`: wajib, maks 100 karakter.
- `genre`: opsional, maks 100 karakter.

## Catatan Integrasi
Role aktif berasal dari `AuthContext` (`src/context/AuthContext.jsx`) dan bisa disimulasikan lewat `RoleSwitcher` pada halaman.
