# ExaBot AI Navigator

Dashboard web (React + Vite + TypeScript) untuk **ExaBot**, terhubung ke backend FastAPI lewat REST (`/api/v1`) dan WebSocket (`/ws/...`).

## Port dev

| Layanan     | Port     | Perintah |
| ----------- | -------- | -------- |
| Frontend    | **8083** | `npm run dev` (bersamaan dengan API) atau hanya UI: `npm run dev:fe` |
| Backend API | **3003** | Ikut jalan saat `npm run dev`, atau manual: `cd exabot-backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 3003` |

`npm run dev` menjalankan **Vite** dan **Uvicorn** paralel (memakai [`concurrently`](https://www.npmjs.com/package/concurrently)). Pastikan Python punya dependensi backend (`pip install -r exabot-backend/requirements.txt`); jika memakai venv di `exabot-backend/.venv`, aktifkan venv itu **atau** sesuaikan `PATH` agar `python` mengarah ke interpreter yang benar.

## Environment frontend

Salin `.env.example` → `.env` di root repo:

```env
VITE_API_URL=http://localhost:3003
VITE_WS_URL=ws://localhost:3003
```

- Jika `VITE_API_URL` tidak di-set, request memakai proxy Vite: path `/api/v1` diarahkan ke backend (lihat `vite.config.ts`).
- `VITE_WS_URL` opsional di dev: default kode mengarah ke `ws://127.0.0.1:3003`.

## Alur singkat

1. Siapkan backend (`.env`, migrasi DB) — lihat `exabot-backend/README.md`.
2. `npm install` lalu `npm run dev` — frontend **8083** dan API **3003** berjalan bersamaan; buka `http://localhost:8083`.
3. **Login** — JWT di `localStorage`; `ProtectedRoute` untuk rute aplikasi. Akun dev diisi otomatis saat API start (non-production) dari `exabot-backend/.env` / `app.config`. Tombol **Login cepat (dev)** memakai `POST /auth/dev-login` (user nyata di DB, tanpa env frontend untuk password). Lihat `exabot-backend/DEV_LOGIN.md`.
4. Halaman **Beranda**, **Data Pasar**, **Prediksi Langsung**, **Analisis AI**, dan **Navbar** memakai React Query + polling; WebSocket memicu *invalidate* query untuk prediksi/pasar/notifikasi.

## Build

```bash
npm run build
```

Output di folder `dist/`.

## Troubleshooting

- **Backend crash: `psycopg2` is not async** — di `exabot-backend/.env` ganti `DATABASE_URL` menjadi `postgresql+asyncpg://...` (bukan `postgresql://`). Lihat [exabot-backend/DEV_LOGIN.md](exabot-backend/DEV_LOGIN.md).
- **Akun dev** — auto-seed saat API start (`exabot-backend/.env`) atau `npm run db:setup`. Login cepat tanpa env frontend (lihat [exabot-backend/DEV_LOGIN.md](exabot-backend/DEV_LOGIN.md)). `/register` mengarah ke `/login`.

