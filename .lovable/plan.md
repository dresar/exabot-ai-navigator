

# ExaBot — Dashboard AI Premium

## Ringkasan
Membangun dashboard SaaS bernama **ExaBot** dengan tampilan futuristik dark mode, glassmorphism, dan aksen neon biru/cyan/ungu. Frontend mockup lengkap dengan 17 halaman, data dummy realistis, responsif mobile-first.

## Design System
- **Dark mode default**: background `#0a0a0f` → `#12121a`, aksen neon biru `#3b82f6`, cyan `#06b6d4`, ungu `#8b5cf6`
- **Light mode**: putih bersih dengan aksen serupa
- **Toggle tema** dengan animasi halus
- Glassmorphism: `backdrop-blur`, border semi-transparan, shadow halus
- Tipografi clean, spacing luas, ikon Lucide konsisten
- Micro-animations: hover scale, fade-in halaman, skeleton loading, tooltip

## Layout
- **Desktop**: Sidebar kiri (collapsible icon mode) + navbar atas (search, notifikasi, profil)
- **Mobile**: Sidebar jadi drawer + bottom navigation 5 item utama
- Konten utama di tengah dengan max-width container

## Halaman (17 menu sidebar)

1. **Beranda** — Kartu statistik (akurasi, win rate, jumlah prediksi, confidence), grafik performa AI dengan Recharts, tabel prediksi terbaru, insight AI
2. **Prediksi Langsung** — Grid kartu real-time dengan probabilitas AI vs market, confidence bar, status badge (pending/selesai), indikator warna
3. **Data Pasar** — List marketplace-style dengan filter, search, harga YES/NO, volume, perubahan %
4. **Analisis AI** — Panel reasoning, sentiment analysis (positif/negatif), faktor pendukung & risiko, bar/pie chart
5. **Simulasi (Paper Trading)** — Saldo virtual, histori prediksi, grafik performa, hasil menang/kalah
6. **Backtesting Lab** — Pilih rentang waktu, tombol jalankan simulasi, hasil akurasi + grafik + Brier score
7. **Pusat Pelatihan AI** — Upload dataset area, progress bar training, grafik peningkatan performa
8. **Model AI** — Daftar model dengan toggle aktif/nonaktif, perbandingan performa antar model
9. **Manajemen API Key** — Input API key, status badge (aktif/limit), usage meter, rotasi key UI
10. **Pembuat Strategi** — Visual builder if-this-then-that dengan kondisi drag & connect style
11. **Manajemen Risiko** — Limit risiko, alokasi modal slider, toggle keamanan
12. **Log Aktivitas** — Tabel lengkap dengan filter, search, pagination
13. **Notifikasi** — List notifikasi dengan badge unread, kategori (sistem/AI/API)
14. **Pengaturan** — Tema toggle, preferensi user, konfigurasi sistem
15. **Dokumentasi Sistem** — Halaman docs lengkap: cara kerja, alur data, arsitektur, penjelasan AI multi-model, backtesting, API rotation — dengan section cards dan diagram
16. **Bantuan** — FAQ accordion, kontak support
17. **Status Sistem** — Uptime indicators, status tiap service (API, AI, Database)

## Komponen Utama
- `ThemeProvider` untuk dark/light toggle
- `AppSidebar` collapsible dengan 17 menu + ikon
- `Navbar` dengan search, notifikasi dropdown, avatar profil
- `StatCard` glassmorphism dengan animasi angka
- `ChartCard` wrapper Recharts dengan gradient fill
- `DataTable` reusable dengan filter & search
- `SkeletonLoader` untuk tiap section
- `EmptyState` dengan ilustrasi menarik
- `StatusBadge` dengan warna indikator
- `BottomNav` untuk mobile

## Teknologi
- React + TypeScript + Tailwind CSS + shadcn/ui
- Recharts untuk grafik
- React Router untuk navigasi 17 halaman
- Framer Motion–style CSS animations
- Semua teks dalam Bahasa Indonesia

## Prioritas Implementasi
1. Design system (tema, CSS variables, glassmorphism utilities)
2. Layout (sidebar, navbar, bottom nav mobile)
3. Beranda (halaman utama dengan statistik & grafik)
4. Prediksi Langsung & Data Pasar
5. Analisis AI & Simulasi
6. Backtesting, Pelatihan AI, Model AI
7. API Key, Pembuat Strategi, Manajemen Risiko
8. Log, Notifikasi, Pengaturan
9. Dokumentasi Sistem, Bantuan, Status Sistem

