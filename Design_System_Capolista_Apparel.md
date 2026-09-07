# DESIGN SYSTEM
# Capolista Apparel — Sistem Manajemen Konveksi

**Versi:** 1.0
**Tujuan dokumen:** Panduan desain untuk merombak/membangun ulang sistem, supaya semua halaman (Dashboard, per-Divisi, Keuangan, mobile staf) konsisten satu sama lain — baik dikerjakan sendiri maupun oleh developer/tim lain.

---

## 1. FILOSOFI DESAIN

Sistem ini dibangun untuk **lantai produksi konveksi**, bukan aplikasi SaaS generik. Prinsip dasarnya:

1. **Fungsional dulu, estetika kedua** — setiap warna dan badge harus punya arti (status, prioritas, divisi), bukan dekorasi.
2. **Beda peran, beda tampilan** — Owner butuh ringkasan besar, Kepala Divisi butuh kontrol kerja tim, Staf butuh satu tugas fokus di HP. Jangan pakai 1 layout untuk semua level.
3. **Jangan pernah tampilkan data mentah tanpa konteks** — angka ganda, status kosong, atau singkatan tanpa label akan disalahartikan sebagai bug oleh pengguna awam.
4. **Konsisten lebih penting dari kreatif** — satu bahasa visual dipakai di semua modul (order, jahit, keuangan, dst) supaya orang tidak perlu belajar ulang tiap buka halaman baru.

---

## 2. DESIGN TOKENS

### 2.1 Warna

| Token | Hex | Kegunaan |
|---|---|---|
| `--bg` | `#F3EFE6` | Latar belakang halaman (kanvas kain, bukan putih polos) |
| `--panel` | `#FBF9F4` | Latar kartu/panel |
| `--ink` | `#211D1A` | Teks utama |
| `--ink-soft` | `#6B655C` | Teks sekunder/caption |
| `--line` | `#DCD3BF` | Border, garis pembatas |
| `--navy` | `#29394A` | Sidebar, header, elemen struktural |
| `--accent` (teal) | `#2F6F62` | **Aksi positif / status "baik"**: selesai, lunas, progres sehat |
| `--gold` | `#C9962B` | **Status "berjalan/perhatian sedang"**: dalam proses, DP, printing |
| `--danger` | `#A8402F` | **Status "butuh tindakan"**: telat, reject, belum bayar, stok kritis |
| `--purple` | `#8A6A9E` | Khusus indikator keuangan/laba (dipakai terbatas) |

**Aturan warna status (berlaku di semua modul):**
- 🟢 Teal = selesai / lunas / aman
- 🟡 Gold = sedang berjalan / DP / menunggu
- 🔴 Merah = terlambat / reject / belum bayar / stok kritis
- ⚪ Abu-abu = netral / belum mulai

Jangan pernah pakai merah untuk tombol aksi biasa (lihat §5.3) — merah di sistem ini **selalu berarti masalah**, bukan "aksi kedua".

### 2.2 Tipografi

| Elemen | Font | Ukuran | Weight |
|---|---|---|---|
| Judul halaman (h1) | Oswald | 24–26px | 600 |
| Judul panel (h2) | Oswald | 15–16px | 600 |
| Angka besar (KPI, counter) | Oswald | 21–44px (kontekstual) | 600 |
| Body text | IBM Plex Sans | 12.5–13px | 400–500 |
| Label kecil/caption | IBM Plex Sans | 10.5–11.5px | 400 |
| Data numerik presisi (ID order, mono) | IBM Plex Mono | 10.5–12.5px | 500 |

**Kenapa 3 font berbeda:** Oswald (condensed, kesan signage pabrik) untuk judul & angka besar supaya terasa tegas; IBM Plex Sans untuk teks baca; IBM Plex Mono untuk apa pun yang harus presisi dibaca (nomor order, kode, angka uang) supaya tidak salah baca "0" vs "O" atau "1" vs "l".

### 2.3 Spacing & Bentuk

- Radius kartu/panel: `4px` (tegas, bukan bulat penuh — kesan industrial)
- Radius badge/pill/tombol kecil: `6–20px` (lebih bulat, untuk elemen interaktif)
- Border standar: `1px solid var(--line)`
- Border penekanan (kartu terpilih): `1.5px solid var(--accent)`
- Aksen "jahitan" di atas kartu KPI: garis putus-putus (`background-image: linear-gradient` dash) — motif khas untuk kartu ringkasan, jangan dipakai di semua tempat supaya tetap jadi ciri khas

---

## 3. STRUKTUR LAYOUT

### 3.1 Shell utama (desktop)
```
┌─────────────┬──────────────────────────────────────────┐
│             │  Topbar: judul halaman + konteks + aksi   │
│  Sidebar    ├──────────────────────────────────────────┤
│  (navy)     │  KPI row (opsional, 3–4 kartu)            │
│  230px      ├──────────────────────────────────────────┤
│             │  Grid 2 kolom: konten utama | panel bantu │
│             │  (rasio ±1.6fr : 1fr)                     │
└─────────────┴──────────────────────────────────────────┘
```

### 3.2 Isi sidebar (urutan tetap, jangan diacak)
1. Brand mark + nama sistem
2. **Ringkasan** — Dashboard, Manajemen Order
3. **Divisi** — urut sesuai alur produksi sebenarnya:
   Produksi (koordinator) → Desain → Cutting → Jahit → Printing → Pemasangan → Pembelian → Gudang & Stok Opname → Keuangan & Akuntansi
4. **Sistem** — Laporan & Analitik, Pengguna & Hak Akses
5. Footer sidebar: nama & role user yang sedang login

> Item aktif (halaman yang sedang dibuka) diberi latar `rgba(255,255,255,.09)` dan teks putih penuh — item lain teks abu muda.

### 3.3 Shell mobile (staf lantai produksi)
Staf level 4 (operator) **tidak pakai sidebar sama sekali**. Layout:
```
┌───────────────────────┐
│ Topbar navy (rounded)  │  ← sapaan + shift
├───────────────────────┤
│ Notice (jika ada alert)│
├───────────────────────┤
│ Task card (1 fokus)    │  ← tugas sekarang saja
├───────────────────────┤
│ Antrean berikutnya     │
├───────────────────────┤
│ Bottom nav (3 ikon)    │  ← Tugas / Riwayat / Profil
└───────────────────────┘
```
Prinsip: staf hanya butuh tahu **satu tugas aktif** + antrean, tidak perlu dashboard analitik.

---

## 4. KOMPONEN UI STANDAR

### 4.1 Kartu KPI
Dipakai di semua dashboard ringkasan (Owner, tiap Kepala Divisi, Keuangan).
- Label kecil (abu) → angka besar (Oswald) → delta/caption kecil di bawah
- Aksen garis jahitan di atas, warna sesuai makna (teal=normal, merah=butuh perhatian, gold=keuangan/menunggu)
- Kalau KPI itu actionable (misal "Total Piutang"), **wajib** ada link/tombol kecil di bawah, jangan cuma angka mati

### 4.2 Panel/Kartu Konten
- Header panel: judul (h2) kiri + caption kecil kanan (mis. "diperbarui 4 menit lalu")
- Isi bisa berupa tabel, list, chart, atau kanban — tidak dicampur lebih dari 1 jenis konten per panel

### 4.3 Tabel Data
- Header kolom huruf kecil, abu, tanpa border tebal
- Baris dipisah garis tipis, bukan zebra-stripe
- Kolom status **selalu** pakai badge berwarna (§4.4), jangan teks polos
- Aksi per baris = tombol mini di kolom paling kanan

### 4.4 Badge/Tag Status
Bentuk pill, dot kecil + teks, warna dari palet status (§2.1).
**Wajib dipakai setiap kali ada 2 transaksi/entri yang mirip tapi beda tahap** (contoh nyata dari revamp Dashboard Keuangan: dua baris "Order #5" harus dibedakan tag `DP` vs `Pelunasan` — tanpa ini, pengguna akan mengira data dobel/bug).

### 4.5 Kanban (untuk divisi produksi: Desain, Cutting, Jahit, Printing, Pemasangan)
- Kolom = tahap kerja divisi tsb (bukan status generik "todo/doing/done")
- Tiap kartu order: ID mono, nama customer, produk, lalu metadata kontekstual (deadline / versi revisi / suhu proses / dll sesuai divisi)
- Klik kartu → buka panel detail di kolom kanan (bukan modal/popup)

### 4.6 Panel Detail + Riwayat Komunikasi
Pola inti pengganti grup WhatsApp — **wajib ada di setiap halaman kerja divisi**:
- Info order + parameter kerja divisi tsb di atas
- Checklist QC (kalau relevan) dengan checkbox bergaya centang, teks yang sudah selesai dicoret
- Tombol aksi utama ("Kirim ke Divisi X") + aksi sekunder (reject/revisi)
- Timeline riwayat komunikasi paling bawah: tiap entri punya dot warna per pengirim (Desain=navy, Procurement=coklat, dst), pesan singkat, timestamp
- Kolom input catatan di paling bawah untuk kirim pesan ke divisi lain

### 4.7 Empty State
**Tidak boleh ada panel kosong tanpa keterangan.** Setiap kondisi "belum ada data" harus punya:
1. Ikon/placeholder kecil
2. 1 baris judul ("Belum ada pengeluaran tercatat")
3. 1 baris penjelasan/ajakan bertindak

### 4.8 Analitik (chart sederhana)
- Cukup pakai bar chart CSS/SVG sederhana, tidak perlu library berat untuk data kecil
- Setiap chart tren wajib ada legenda warna (mis. hijau=pemasukan, merah=pengeluaran)
- Selalu sandingkan angka besar (total) + chart, jangan chart tanpa angka atau angka tanpa konteks tren

---

## 5. PRINSIP PERAN & HIERARKI (RBAC)

| Level | Yang dilihat | Yang TIDAK dilihat |
|---|---|---|
| **Superadmin** | Konfigurasi sistem, audit log semua user, kelola role/divisi | — |
| **Owner** | Semua dashboard bisnis, semua divisi (read + laporan) | Konfigurasi teknis sistem |
| **Admin** | Semua order, assign ke divisi, laporan operasional | Konfigurasi teknis sistem |
| **Kepala Divisi** | Kanban/dashboard divisinya sendiri, semua staf dalam divisinya, komunikasi lintas divisi | Data divisi lain secara detail |
| **Staf** | Tugas yang di-assign ke dirinya sendiri saja | Data staf lain, dashboard analitik, divisi lain |

**Aturan turunan:** makin rendah level, makin sedikit dan makin fokus tampilannya. Jangan beri Staf akses ke tampilan Kepala Divisi meski di-hide sebagian — beda level = beda desain halaman, bukan beda toggle visibility di halaman yang sama.

---

## 6. POLA KHUSUS PER TIPE DIVISI

Jangan pakai 1 template kanban untuk semua — sesuaikan dengan sifat kerjanya:

| Tipe Divisi | Pola UI | Contoh |
|---|---|---|
| **Koordinator** (Produksi) | Dashboard pengawasan lintas sub-divisi, tabel bottleneck, kapasitas tim, eskalasi ke atas | Progres per tahap, "Order butuh perhatian", kapasitas tim (bar per sub-divisi) |
| **Kreatif/approval** (Desain) | Kanban revisi, preview visual besar, version history, approval dari customer | Thumbnail mockup, version chip V1/V2 |
| **Mesin/proses fisik** (Printing, Pemasangan) | Kanban + parameter mesin real-time, checklist QC | Suhu heat press, timer countdown |
| **Tenaga manusia per orang** (Jahit, Cutting) | Progres per staf individual, pencatatan reject dengan penyebab | Progress bar per penjahit, breakdown ukuran S/M/L/XL |
| **Keuangan** | KPI uang, tabel transaksi dengan tag jenis (DP/Pelunasan), breakdown biaya, piutang, analitik tren | Grafik arus kas, ranking kontribusi omzet |
| **Level staf (mobile)** | Satu tugas fokus, counter besar, tanpa data lintas staf/divisi | Counter +/− pcs selesai |

---

## 7. KESALAHAN UMUM YANG HARUS DIHINDARI

Daftar ini diambil dari review langsung terhadap sistem lama — jadikan checklist QA sebelum rilis halaman baru:

- ❌ Dua entri data mirip tanpa label pembeda (mis. dua "Order #5" tanpa keterangan DP/Pelunasan) → ✅ selalu beri tag jenis transaksi
- ❌ Panel/section kosong tanpa keterangan apa pun → ✅ pakai pola Empty State (§4.7)
- ❌ Warna tombol dipilih asal (merah untuk aksi netral) → ✅ warna tombol/badge selalu ikut makna status (§2.1)
- ❌ Angka penting (piutang, KPI kritikal) ditampilkan sebagai teks mati → ✅ beri link/aksi tindak lanjut
- ❌ Semua level user (Owner sampai Staf) pakai 1 desain dashboard yang sama → ✅ desain per level sesuai kebutuhan (§5)
- ❌ Semua divisi pakai template kanban generik yang sama → ✅ sesuaikan dengan tipe kerja divisi (§6)
- ❌ Riwayat/log tidak ada, koordinasi masih lewat WhatsApp di luar sistem → ✅ setiap order punya riwayat komunikasi tertanam (§4.6)

---

## 8. CHECKLIST IMPLEMENTASI

Gunakan ini saat merombak tiap halaman:

- [ ] Palet warna & font sesuai §2, tidak pakai warna/hex di luar token
- [ ] Sidebar mengikuti urutan divisi sesuai alur produksi nyata (§3.2)
- [ ] Setiap status (order, pembayaran, QC) pakai badge berwarna, bukan teks polos
- [ ] Setiap KPI penting sudah actionable (ada link/tombol jika relevan)
- [ ] Tidak ada empty state kosong tanpa keterangan
- [ ] Halaman divisi produksi punya panel riwayat komunikasi
- [ ] Tampilan berbeda untuk Kepala Divisi vs Staf (bukan 1 halaman untuk semua)
- [ ] Warna tombol sesuai fungsi (primer/sekunder/danger), bukan asal pilih
- [ ] Data ganda/mirip sudah dikasih label pembeda yang jelas

---

*Dokumen ini dibuat berdasarkan seluruh mockup yang sudah dirancang untuk Capolista Apparel (Dashboard Owner, Produksi, Desain, Jahit, Printing, Pemasangan, Keuangan & Akuntansi, serta versi mobile staf). Gunakan sebagai acuan tunggal supaya developer/tim desain lain bisa melanjutkan tanpa harus menebak-nebak gaya visual yang sudah dibangun.*
