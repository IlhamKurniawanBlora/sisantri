
# SiDawam

SiDawam adalah aplikasi web yang dirancang khusus untuk pondok pesantren, memudahkan pengelolaan data santri dan penyebaran berita/informasi terkini. Aplikasi ini dapat diakses oleh dua tipe pengguna utama: **admin** (pengelola) dan **guest** (pengunjung).

---

## Apa itu SiDawam?

SiDawam membantu pondok pesantren dalam menyimpan, menampilkan, dan mengelola data santri serta berita secara digital. Dengan tampilan yang ramah pengguna, aplikasi ini memudahkan pengunjung untuk mencari informasi santri dan membaca berita terbaru, serta memudahkan admin dalam mengelola data secara efisien.

---

## Fitur Utama

### 1. Data Santri
Pengunjung dapat melihat daftar santri yang terdaftar di pondok pesantren. Setiap santri memiliki profil yang berisi:
- Foto profil
- Nama lengkap
- Tempat dan tanggal lahir
- Jenis kelamin
- Asal alamat/domisili
- Pendidikan terakhir

Fitur pencarian memudahkan pengunjung menemukan santri berdasarkan nama.

### 2. Berita
Pengunjung dapat membaca berita atau informasi terbaru yang dipublikasikan oleh pondok pesantren. Setiap berita menampilkan:
- Judul
- Deskripsi singkat
- Gambar pendukung
- Tanggal publikasi

---

## Alur Penggunaan

### Sebagai Guest (Pengunjung)
- **Home**: Halaman utama yang menampilkan gambaran aplikasi dan informasi penting.
- **Data Santri**: Melihat daftar santri, mencari santri berdasarkan nama, dan melihat detail profil santri.
- **Blog**: Membaca berita/informasi terbaru dari pondok pesantren.
- **About**: Mengetahui latar belakang aplikasi dan profil pondok pesantren.

### Sebagai Admin
- **Manajemen Santri**: Menambah, mengedit, menghapus, dan melihat detail data santri.
- **Manajemen Berita**: Menambah, mengedit, menghapus, dan melihat detail berita.

---

## Kenapa Menggunakan SiDawam?

- Memudahkan pengelolaan data santri secara digital
- Mempercepat penyebaran informasi kepada santri dan masyarakat
- Tampilan sederhana dan mudah digunakan
- Akses data santri dan berita kapan saja melalui web

---

## Struktur Folder (Informasi Umum)
 
## Supabase setup

1. Copy `.env.example` to `.env` and fill the values from your Supabase project.

2. Install dependencies (using pnpm recommended):

```powershell
pnpm install
```

3. Run development server:

```powershell
pnpm dev
```

Notes:
- The project injects a client-side Supabase instance via `app/plugins/supabase.client.ts`.
- Server-side utilities can use `server/utils/supabase.server.ts` which uses the service role key.
