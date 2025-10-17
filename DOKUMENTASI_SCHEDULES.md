# 📅 Dokumentasi Fitur Admin Schedules

## Overview
Fitur Admin Schedules memungkinkan administrator untuk mengelola jadwal pembelajaran pesantren dengan tampilan card yang elegan berdasarkan kelas yang terkait.

## 📁 Struktur File yang Dibuat

### 1. API Endpoints (`/server/api/schedules/`)

#### `index.get.ts` - Get All Schedules
- **Method**: GET
- **Parameters**: 
  - `page`: Halaman (default: 1)
  - `limit`: Item per halaman (default: 10)
  - `search`: Cari berdasarkan nama/deskripsi
  - `sortBy`: Urutkan (newest, oldest, name_asc, name_desc, start_date)
  - `includeDeleted`: Tampilkan yang dihapus (default: false)
- **Response**: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string|null",
        "start_at": "timestamp",
        "end_at": "timestamp",
        "classes": [
          {
            "id": "uuid",
            "name": "string",
            "image_url": "string|null"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 0,
      "totalPages": 0
    },
    "filters": {...}
  }
  ```

#### `index.post.ts` - Create/Update Schedule
- **Method**: POST
- **Body**:
  ```json
  {
    "id": "uuid (optional untuk update)",
    "name": "string (required)",
    "description": "string|null",
    "start_at": "ISO8601 timestamp (required)",
    "end_at": "ISO8601 timestamp (required)"
  }
  ```
- **Validations**:
  - Nama jadwal harus diisi
  - Tanggal mulai dan selesai harus diisi
  - Tanggal mulai harus lebih awal dari tanggal selesai

#### `stats.get.ts` - Get Schedule Statistics
- **Method**: GET
- **Response**:
  ```json
  {
    "total": 0,
    "active": 0,
    "inactive": 0,
    "today": 0,
    "upcoming": 0,
    "withClasses": 0
  }
  ```

#### `[id]/get.ts` - Get Single Schedule
- **Method**: GET
- **Parameter**: `id` (schedule UUID)
- **Response**: Schedule object dengan relasi classes

#### `[id]/delete.ts` - Soft Delete Schedule
- **Method**: DELETE
- **Parameter**: `id` (schedule UUID)
- **Action**: Set `deleted_at` timestamp

#### `[id]/restore.ts` - Restore Deleted Schedule
- **Method**: DELETE (menggunakan DELETE untuk konsistensi)
- **Parameter**: `id` (schedule UUID)
- **Action**: Set `deleted_at` ke null

#### `[id]/delete-permanent.ts` - Permanent Delete
- **Method**: DELETE
- **Parameter**: `id` (schedule UUID)
- **Action**: Hapus record secara permanen dari database

### 2. Pages (`/app/pages/admin/`)

#### `schedules.vue` - Parent Layout
- Layout induk untuk halaman schedules
- Menampilkan nested route (NuxtPage)

#### `schedules/index.vue` - Main Schedule Management Page
- **Fitur**:
  - 📊 Display statistik jadwal (Total, Aktif, Tidak Aktif, Dengan Kelas, Akan Datang)
  - 🔍 Search filter untuk mencari jadwal
  - ⬇️ Sort options (Terbaru, Terlama, Nama A-Z, Tanggal Mulai)
  - ✅ Include deleted toggle untuk menampilkan jadwal yang dihapus
  - 📋 Pagination untuk list jadwal
  - 🎨 Card layout view dengan informasi:
    - Nama dan status jadwal
    - Tanggal mulai/selesai
    - List kelas yang terkait (maksimal 4 dengan badge untuk sisanya)
    - Aksi (Detail, Edit, Delete/Restore)
  - 🖼️ Gambar kelas dalam card untuk visual reference

### 3. Components (`/app/components/Admin/Schedule/`)

#### `Form.vue` - Schedule Form Component
- **Props**:
  - `mode`: 'add' | 'edit'
  - `schedule`: Schedule object (optional)
- **Features**:
  - Form input untuk Nama Jadwal
  - Textarea untuk Deskripsi
  - DateTime picker untuk Tanggal Mulai
  - DateTime picker untuk Tanggal Selesai
  - Validasi input
  - Error messages
  - Loading state pada tombol submit
- **Events**:
  - `@saved`: Emit ketika berhasil menyimpan
  - `@close`: Emit ketika ditutup

#### `Detail.vue` - Schedule Detail Component
- **Props**:
  - `schedule`: Schedule object (required)
- **Displays**:
  - Informasi jadwal lengkap
  - Timeline dengan tanggal mulai/selesai
  - Durasi jadwal (calculated)
  - List kelas terkait dengan gambar
  - Metadata sistem (created_at, updated_at, deleted_at, ID)

## 🎨 UI/UX Features

### Card Layout
- **Responsive**: 1 kolom (mobile), 2 kolom (tablet), 3 kolom (desktop)
- **Hover Effects**: Shadow transition untuk feedback
- **Status Badge**: Visual indicator untuk status aktif/tidak aktif
- **Class Display**: Grid maksimal 4 kelas dengan overflow badge

### Empty States
- Pesan yang berbeda untuk "Belum Ada Jadwal" vs "Jadwal Tidak Ditemukan"
- CTA buttons untuk membuat jadwal baru atau reset pencarian

### Modals & Slideovers
- **Slideover Form**: Untuk menambah/edit jadwal (dari sidebar)
- **Modal Detail**: Untuk melihat detail jadwal lengkap
- **Confirm Dialog**: Untuk aksi delete/restore

## 🔄 Data Flow

```
Index Page (list & filter)
    ↓
API: /api/schedules (GET)
    ↓
Display cards with classes
    ↓
Actions:
  - Click Detail → Show Modal Detail
  - Click Edit → Show Slideover Form → API: /api/schedules (POST)
  - Click Delete → Confirm Dialog → API: /api/schedules/[id]/delete (DELETE)
  - Click Restore → Confirm Dialog → API: /api/schedules/[id]/restore (DELETE)
```

## 📊 Database Relation

```
schedules table
├── id (UUID, primary key)
├── name (string)
├── description (text, nullable)
├── start_at (timestamp)
├── end_at (timestamp)
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp, nullable)

classes table
├── id (UUID, primary key)
└── ... (fields lainnya)
```

## ✨ Fitur Unggulan

1. **Soft Delete & Restore**: Data tidak langsung terhapus, bisa dipulihkan
2. **Relasi dengan Classes**: Otomatis menampilkan kelas yang terkait
3. **Search & Filter**: Cari berdasarkan nama/deskripsi, urutkan, tampilkan yang dihapus
4. **Pagination**: Handle data besar dengan mudah
5. **Responsive Design**: Optimal di semua ukuran layar
6. **Konfirmasi Dialog**: Prevents accidental deletion
7. **Toast Notifications**: User feedback untuk setiap aksi
8. **Datetime Management**: Validasi tanggal mulai < tanggal selesai
9. **Duration Calculation**: Otomatis hitung berapa lama jadwal berlangsung
10. **Card Preview**: Lihat kelas yang terkait langsung di card

## 🚀 Cara Menggunakan

### Mengakses Halaman
1. Navigate ke `/admin/schedules`
2. Akan menampilkan list semua jadwal dalam card layout

### Membuat Jadwal Baru
1. Click tombol "Tambah Jadwal"
2. Isi form (Nama, Deskripsi, Tanggal Mulai, Tanggal Selesai)
3. Click "Tambah Jadwal"

### Mengedit Jadwal
1. Klik tombol "..." (more actions) pada card
2. Pilih "Edit"
3. Update data yang ingin diubah
4. Click "Simpan Perubahan"

### Melihat Detail Jadwal
1. Klik tombol "..." (more actions) pada card
2. Pilih "Detail"
3. Lihat informasi lengkap di modal

### Menghapus Jadwal
1. Klik tombol "..." (more actions) pada card
2. Pilih "Hapus"
3. Confirm pada dialog
4. Jadwal akan masuk ke trash (soft delete)

### Memulihkan Jadwal
1. Aktifkan "Tampilkan yang dihapus" checkbox
2. Klik tombol "..." pada jadwal yang dihapus
3. Pilih "Pulihkan"
4. Jadwal akan aktif kembali

### Menghapus Permanen
1. Aktifkan "Tampilkan yang dihapus" checkbox
2. Klik tombol "..." pada jadwal yang dihapus
3. Pilih "Hapus Permanen"
4. Jadwal akan terhapus selamanya

## 📝 Notes

- Semua API endpoints mengikuti pattern yang sama dengan API lain (blogs, classes, santris)
- Component menggunakan Nuxt UI untuk konsistensi dengan design system
- Validasi dilakukan di frontend dan backend untuk keamanan
- Response time optimal dengan query yang efficient
- Support pagination untuk handle large datasets
