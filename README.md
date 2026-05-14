# TikTakTuk

Monorepo ini berisi:

- Frontend `React + Vite + Tailwind CSS`
- Backend `Elysia + Bun + TypeScript`
- Database `PostgreSQL` dengan query `raw SQL` via `pg`

Arsitektur development:

```text
React Frontend (Vite)
        ↓ HTTP / REST API
Elysia Backend (Bun)
        ↓ raw SQL with pg
PostgreSQL
```

Port lokal default:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Tech Stack

### Frontend

- `React`
- `Vite`
- `React Router DOM`
- `Tailwind CSS`
- `Lucide React`
- `clsx`

### Backend

- `Elysia`
- `@elysiajs/cors`
- `Bun`
- `TypeScript`
- `pg`
- `PostgreSQL`

## Prerequisites

Sebelum menjalankan project ini, install:

- `Git`
- `Node.js` versi LTS
- `npm`
- `Bun`
- `PostgreSQL` atau akses ke database PostgreSQL online

Yang wajib untuk backend:

- `DATABASE_URL`
- File `.env` untuk backend

## Installation by Platform

### Windows

Install Git:

```powershell
git --version
```

Download jika belum ada:

```text
https://git-scm.com/downloads/win
```

Install Node.js LTS, lalu cek:

```powershell
node -v
npm -v
```

Download jika belum ada:

```text
https://nodejs.org/
```

Install Bun:

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
bun -v
```

### macOS

Install Git:

```bash
brew install git
git --version
```

Install Node.js:

```bash
brew install node
node -v
npm -v
```

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.zshrc
bun -v
```

Kalau pakai `bash`:

```bash
source ~/.bashrc
bun -v
```

### Linux (Arch btw)

Install Git:

```bash
sudo pacman -Syu --noconfirm git
git --version
```

Install Node.js dan npm:

```bash
sudo pacman -S --noconfirm nodejs npm
node -v
npm -v
```

Atau via `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v
npm -v
```

Install Bun:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
bun -v
```

## Clone Repository

```bash
git clone https://github.com/TikTakTuk-D-D4/TK03-TikTakTuk-D4-Frontend.git
cd tiktaktuk
```

Kalau repo lokal sudah ada, cukup lakukan pull terbaru:

```bash
git pull
```

## Install Dependencies

Project ini punya dua environment dependency:

- Root folder untuk frontend React
- Folder `Backend` untuk backend Bun + Elysia

### Frontend

Install dependency frontend dari root project:

```bash
npm install
```

Dependency utama frontend yang dipakai:

```bash
npm install react react-dom react-router-dom lucide-react clsx
npm install -D vite tailwindcss @tailwindcss/vite
```

### Backend

Masuk ke folder backend lalu install dependency:

```bash
cd Backend
bun install
```

Dependency backend yang dipakai saat ini:

```bash
bun add elysia @elysiajs/cors pg
bun add -d typescript bun-types @types/pg
```

Kalau semua package sudah ada di `package.json`, `bun install` saja sudah cukup.

## Environment Setup

Buat file `.env` di folder `Backend`.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Kalau belum ada `.env.example`, buat `.env` manual dengan isi seperti ini:

```env
PORT=3000
DATABASE_URL=postgresql://username:password@host:5432/database
FRONTEND_URL=http://localhost:5173
JWT_SECRET=change-this-secret
NODE_ENV=development
```

Penjelasan variabel:

- `PORT`: port backend
- `DATABASE_URL`: connection string PostgreSQL
- `FRONTEND_URL`: URL frontend untuk CORS
- `JWT_SECRET`: secret auth jika dipakai
- `NODE_ENV`: `development` atau `production`

Untuk frontend, jika diperlukan, arahkan API ke backend:

```env
VITE_API_URL=http://localhost:3000
```

## Running the Project

Frontend dan backend jalan terpisah, jadi biasanya perlu dua terminal.

### Jalankan Frontend

Dari root project:

```bash
npm run dev
```

Buka:

```text
http://localhost:5173
```

### Jalankan Backend

Dari folder `Backend`:

```bash
bun run dev
```

Target backend lokal:

```text
http://localhost:3000
```

## Build Frontend

Build production frontend:

```bash
npm run build
```

Preview hasil build:

```bash
npm run preview
```

## Backend Notes

Backend ini mengikuti requirement TK04:

- memakai `raw SQL`
- tidak memakai ORM
- database target adalah `PostgreSQL`
- error dari database sebaiknya diteruskan ke frontend tanpa diubah ulang

Jangan pakai:

- `Prisma`
- `Sequelize`
- `TypeORM`
- `Drizzle ORM`
- ORM lain

## Branch Ownership

- `feat/auth-dashboard`
- `feat/venue-event`
- `feat/artist-ticket-category`
- `feat/order-promotion`
- `feat/ticket-seat`

## Troubleshooting

### `node`, `npm`, atau `bun` tidak dikenali

Cek apakah semua runtime sudah terinstall dan terminal sudah direstart:

```bash
node -v
npm -v
bun -v
```

### Dependency backend belum terpasang

Masuk ke folder backend lalu install ulang:

```bash
cd Backend
bun install
```

### Port frontend bentrok

Jalankan:

```bash
npm run dev -- --port 5174
```

### Backend tidak bisa connect ke database

Periksa:

- `DATABASE_URL` valid
- database PostgreSQL aktif
- IP dan credential database benar
- `FRONTEND_URL` sesuai origin frontend
