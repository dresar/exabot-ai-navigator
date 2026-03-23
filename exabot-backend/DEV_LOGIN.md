# Login dev & database

## Error: `psycopg2` is not async

Set **`DATABASE_URL=postgresql+asyncpg://...`** di `exabot-backend/.env` (lihat `.env.example`).

## Satu file konfigurasi: `exabot-backend/.env`

Tidak perlu env terpisah di frontend untuk kredensial login dev.

- **`AUTO_SEED_DEV_USER_ON_STARTUP=true`** (default): saat API start (bukan production), user dev dibuat di PostgreSQL jika belum ada (`DEV_SEED_*`).
- **`POST /api/v1/auth/dev-login`**: tombol **Login cepat (dev)** di UI memanggil ini — JWT **dari user nyata di DB**, tanpa password di browser (hanya aktif jika `ENVIRONMENT` bukan `production` dan `AUTH_DEV_QUICK_LOGIN=true`).

Default user (bisa diubah lewat env backend):

- Email: `dev@localhost` (`DEV_QUICK_LOGIN_EMAIL` / `DEV_SEED_EMAIL`)
- Password untuk login form: `DevPass123!` (`DEV_SEED_PASSWORD`) — sama dengan hash di DB setelah auto-seed.

## Migrasi

```bash
npm run db:migrate
```

Seed manual (opsional, biasanya tidak perlu jika auto-seed sudah jalan):

```bash
npm run seed:dev
```

## Production

Set `ENVIRONMENT=production` — `/auth/dev-login` dinonaktifkan dan auto-seed dev tidak jalan.
