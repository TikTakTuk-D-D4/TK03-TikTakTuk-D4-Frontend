# Ticket Categories Module (TK03)

## Tujuan
Modul ini menangani kategori tiket event dengan aturan akses:

- `guest`: read-only (public)
- `customer`: read-only
- `organizer`: create/update/delete hanya untuk event miliknya
- `admin`: full create/update/delete untuk semua event

## Struktur
- `TicketCategoryTable.jsx`: tabel list + search + filter event.
- `TicketCategoryFormModal.jsx`: form create/edit + validasi kuota.
- `TicketCategoryDeleteDialog.jsx`: konfirmasi hapus.

## Sumber Data
Data in-memory melalui service:

- `src/features/artist-ticket-category/services/ticketCategoryService.js`
- Seed awal:
  - `src/data/mockCategories.js`
  - `src/data/mockEvents.js`
  - `src/data/mockVenues.js`

## Aturan Validasi
- `name`: wajib, maksimal 50 karakter.
- `price`: angka tidak negatif (`>= 0`).
- `quota`: bilangan bulat positif (`> 0`).
- `quota` gabungan semua kategori per event tidak boleh melebihi `venue.capacity`.

## Aturan Akses Organizer
- Organizer hanya boleh membuat kategori pada event dengan `event.organizerId === user.id`.
- Organizer hanya boleh edit/hapus kategori dari event miliknya.

## Catatan Integrasi
Role aktif berasal dari `AuthContext` (`src/context/AuthContext.jsx`) dan bisa disimulasikan lewat `RoleSwitcher`.
