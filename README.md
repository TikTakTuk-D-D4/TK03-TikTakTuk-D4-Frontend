# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🎟️ TikTakTuk Frontend (TK03)

---

## Tech Stack

- **React**
- **Vite**
- **React Router DOM** 
- **Tailwind CSS**
- **Lucide React**
- **clsx**

---

## Prerequisites

Sebelum menjalankan project ini, pastikan komputer sudah memiliki:

- **Node.js** (disarankan versi **LTS**, minimal v18+)
- **npm** (biasanya ikut terpasang bersama Node.js)
- **Git**

---

# 🛠️ Instalasi 

## 1) Install Git

### macOS
```bash
brew install git
git --version
````

### Windows

Unduh installer Git dari:

```text
https://git-scm.com/downloads/win
```

Lalu cek di **Command Prompt** / **PowerShell**:

```bash
git --version
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y git
git --version
```

---

## 2) Install Node.js dan npm

## 🍎 macOS

### Opsi A — Homebrew (recommended)

```bash
brew install node
node -v
npm -v
```

### Opsi B — Installer resmi

Unduh dari:

```text
https://nodejs.org/
```

Pilih **LTS** lalu install seperti biasa.

Cek:

```bash
node -v
npm -v
```

---

## 🪟 Windows

Unduh installer resmi dari:

```text
https://nodejs.org/
```

Pilih **LTS (Recommended)**, install, lalu cek di **Command Prompt** atau **PowerShell**:

```bash
node -v
npm -v
```

Kalau belum terbaca, restart terminal atau restart komputer.

---

## 🐧 Linux (Ubuntu/Debian)

### Opsi A — Install langsung dari apt

```bash
sudo apt update
sudo apt install -y nodejs npm
node -v
npm -v
```

### Opsi B — Install via NVM (recommended)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
node -v
npm -v
```

Kalau shell kamu pakai zsh:

```bash
source ~/.zshrc
```

---

# 🚀 Menjalankan Project dari Repository

## 1) Clone repository

```bash
git clone https://github.com/TikTakTuk-D-D4/TK03-TikTakTuk-D4-Frontend.git
cd tiktaktuk
```

## 2) Install semua dependency

```bash
npm install
```

## 3) Jalankan development server

```bash
npm run dev
```

## 4) Buka di browser

```text
http://localhost:5173
```

---

# 📦 Semua langkah install dependency dasar sekaligus

Kalau mau install satu per satu seperti di atas tidak masalah.
Kalau mau sekaligus, bisa pakai:

```bash
npm install react-router-dom lucide-react clsx
npm install -D tailwindcss @tailwindcss/vite
```

---

# ⚙️ Menjalankan Project

Setelah semua dependency terpasang:

```bash
npm run dev
```

Untuk menghentikan server:

```bash
Ctrl + C
```

---

# 🧪 Build Project

Untuk build production:

```bash
npm run build
```

Untuk preview hasil build:

```bash
npm run preview
```

---

# 👥 Pembagian Branch

* `feat/auth-dashboard`
* `feat/venue-event`
* `feat/artist-ticket-category`
* `feat/order-promotion`
* `feat/ticket-seat`


# ⚠️ Troubleshooting

## `node` atau `npm` tidak dikenali

Pastikan Node.js sudah terinstall dan terminal sudah direstart.

Cek:

```bash
node -v
npm -v
```

---

## Jika port 5173 sudah dipakai

Jalankan:

```bash
npm run dev -- --port 5174
```

Lalu buka:

```text
http://localhost:5174
```

---

## Dependency gagal install

Coba hapus `node_modules` dan lock file, lalu install ulang:

### macOS / Linux

```bash
rm -rf node_modules package-lock.json
npm install
```

### Windows PowerShell

```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

# ✅ Quick Start

Kalau kamu sudah punya Node.js dan Git, langkah tercepatnya:

```bash
git clone https://github.com/TikTakTuk-D-D4/TK03-TikTakTuk-D4-Frontend.git
cd tiktaktuk
npm install
npm run dev
```

---


```
```
