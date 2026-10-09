# Zeinity Creator Studio 🎬⚡

**Workspace Terpadu Produksi YouTube Shorts Berbasis Riset & Standar Editorial**  
*Single Source of Truth untuk Kanal YouTube [@ZeinityShorts](https://youtube.com/@ZeinityShorts)*

> *"Pusat update dan fakta esensial seputar dunia digital dan kehidupan modern tanpa basa-basi—padat, jelas, visual, dan tuntas dalam waktu di bawah 60 detik."*

---

## 🌟 Ikhtisar Produk

**Zeinity Creator Studio** dirancang khusus untuk memfasilitasi alur kerja produksi YouTube Shorts dari hulu ke hilir secara terpadu:
1. **Signal & Idea Intake (24–72 jam terakhir)**
2. **Fact-Checking & Verifikasi Sumber Resmi**
3. **Penyusunan Naskah 4-Tahap (90–140 kata) & Validator Formula Judul**
4. **Perencanaan Visual Storyboard & Safe-Zone Simulator 9:16 (1080×1920)**
5. **Quality Control Production Checklist & Asset Library**
6. **Penjadwalan Terstruktur (Senin, Kamis & Minggu pukul 07:00 WIB)**
7. **Evaluasi Metrik Algoritma (Target: Viewed ≥ 70% & APV 90%–110%)**

Aplikasi ini 100% gratis, responsif, berkinerja instan dengan arsitektur **Offline-First (LocalStorage)** serta didukung **Supabase Cloud Sync** dan **9Router AI Gateway (Combos)**.

---

## 🚀 Fitur Unggulan

### 1. Creator Command Center (Dashboard)
- Status pipeline seluruh video secara real-time.
- Countdown dan pengingat jadwal publikasi resmi: **Senin, Kamis, dan Minggu pukul 07:00 WIB**.
- Pemisahan eksplisit antara **Tenggat Produksi (Editing Deadline)** dan **Jadwal Publikasi (Publish Date)**.
- Peringatan dini jika ada video yang melewati tenggat produksi (*overdue*).
- Indikator performa rata-rata channel terhadap standar acuan Zeinity:
  - **Hook Health (Viewed vs Swiped):** Target ≥ 70%
  - **Retensi (Average Percentage Viewed / APV):** Target 90%–110%

### 2. Content Pipeline & Kalender Rilis
- **Tampilan Kanban Board:** Alur kerja 8 fase (*Ide → Riset → Penulisan → Siap Produksi → Editing → Review → Terjadwal → Terbit*).
- **Tampilan Kalender Rilis:** Penanda slot rilis mingguan dan batas waktu editing.
- **Tampilan Tabel Ringkas:** Dense view dengan inline editor status dan indikator jumlah kata.
- **Filter Komprehensif:** Berdasarkan 5 Pilar Konten (*Internet & Medsos, AI & Tech, Digital Economy, Gaming, Modern Life*) dan 4 Format Shorts (*Flash News, Quick Breakdown, Actionable Tip, Myth Buster*).

### 3. Unified Content Workspace (Studio per Video)
Setiap video memiliki satu ruang kerja mendalam dengan 5 tab alur kerja terpadu:
- **Tab 1: Riset & Fakta**
  - Penyimpanan URL dokumen resmi, changelog, dan tanggal sumber.
  - Pemisahan klaim, bukti kutipan (*quotes*), dan kesimpulan fakta.
  - Status verifikasi: *Terverifikasi Resmi, Perlu Konfirmasi, Rumor/Promosi, Kedaluwarsa, Belum Dicek*.
- **Tab 2: Naskah & Validator Judul**
  - **Validator Judul Real-time:** Memeriksa awalan formula wajib (*Apa/Kenapa/Bagaimana*), panjang kata (*5–10 kata*), dan bentuk kalimat tanya (*?*).
  - **Dual-Mode Editor:** Mode *4-Stage Guided Editor* (Hook 0–3s, Context 4–10s, Core Payoff 11–45s, Loop/CTA 46–60s) dan Mode *Continuous Freeform View*.
  - **Kalkulator Tempo Bicara:** Konfigurasi 130–160 WPM (default 145 WPM) dengan progress bar target 90–140 kata.
  - Generator variasi judul & draf naskah AI.
  - Tombol salin naskah utuh & ekspor berkas Markdown.
- **Tab 3: Safe-Zone Simulator 9:16 & Storyboard**
  - Kanvas vertikal 9:16 interaktif acuan 1080×1920.
  - Simulasi Safe Zone: **Atas 15%** (Header), **Tengah 60%** (Zona Aman Konten & Teks Hook), **Bawah 25%** (UI Shorts).
  - Lapisan mockup UI YouTube Shorts (tombol like, komentar, share, profil `@ZeinityShorts`).
  - Unggah screenshot / gambar B-roll untuk uji keterbacaan teks kontras.
  - Tabel storyboard shot list sinkron dengan naskah.
- **Tab 4: Checklist Produksi & Asset Library**
  - Checklist 7 poin QC (VO, B-roll 1080p, dynamic auto-captions 2–4 kata, safe zone, audio balance, royalty-free audio, interaksi 60 menit pertama).
  - Pustaka tautan file aset proyek (Drive/Cloud/Local).
- **Tab 5: Analitik & Evaluasi Algoritma**
  - Input metrik YouTube Analytics pasca-terbit.
  - Smart Benchmark Badges: *Viral Hook (≥70%)*, *Seamless Loop Berhasil (>100% APV)*, dsb.
  - *Editorial Learning Logbook:* Catatan *What Worked*, *What Failed*, dan *Next Experiment*.

### 4. Integrasi 9Router AI Gateway (dengan Combos)
- Terhubung langsung ke gateway 9Router lokal/remote via endpoint OpenAI-compatible (`http://localhost:20128/v1`).
- Mendukung fitur **Combos** (rantai multi-model fallback cascade).
- Asisten khusus workflow Zeinity: *Topic Discovery, Script Drafter, Title Variations, Fact Check*.
- Tetap dilengkapi *Smart Local Rule-based Generator* bawaan jika gateway sedang offline.

### 5. Supabase Cloud Sync & Portabilitas Data
- **Offline-First:** Langsung aktif bekerja tanpa konfigurasi database cloud.
- **Supabase Cloud Sync:** Klien membaca `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari file `.env` atau menu Pengaturan di UI.
- **Skema SQL:** File `supabase/schema.sql` siap disalin ke SQL Editor Supabase Dashboard.
- **Backup & Restore:** Ekspor/Impor instan seluruh basis data dalam berkas JSON.
- **Ekspor Lembar Produksi:** Ekspor 1-klik ke format `.md` lengkap dengan metadata, naskah, shot list, dan checklist.

---

## 🛠️ Instalasi & Menjalankan Aplikasi

### Prasyarat:
- Node.js versi 18+ (disarankan Node 20+)
- npm / pnpm / yarn

### Langkah Cepat:

1. **Jalankan dependensi (sudah terinstal):**
   ```bash
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:5173`.

3. **Build untuk production:**
   ```bash
   npm run build
   ```

---

## ⚙️ Konfigurasi Environment (`.env`)

Buat berkas `.env` di folder root (atau gunakan template dari `.env.example`):

```env
# Supabase Cloud Sync (Opsional - Dapatkan gratis di supabase.com)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 9Router AI Gateway
VITE_NINEROUTER_BASE_URL=http://localhost:20128/v1
VITE_NINEROUTER_API_KEY=
VITE_NINEROUTER_COMBO=zeinity-combo
```

*Catatan: Anda juga dapat memasukkan kredensial ini kapan saja langsung melalui tombol Pengaturan (ikon roda gigi) di dalam aplikasi.*

---

## 📦 Skema Database Supabase

Untuk mengaktifkan sinkronisasi cloud Supabase:
1. Buka proyek Anda di [supabase.com](https://supabase.com).
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase/schema.sql` di proyek ini, salin seluruh kodenya, lalu klik **Run**.
4. Masukkan Project URL dan Anon Key ke file `.env` atau menu Pengaturan studio.
