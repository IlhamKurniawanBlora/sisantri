# Supabase Guidelane

Panduan ini menjelaskan konfigurasi Supabase untuk aplikasi Sistem Informasi Pesantren (backend). Materi mencakup: pembuatan project, desain tabel utama (santri, blog, users), autentikasi, Row Level Security (RLS), migrasi, integrasi dengan Nuxt 4 dan Zod, serta best practice CMS untuk modul terkait.

Bagian ini ditujukan untuk developer yang akan mengelola backend. Saya akan menjelaskan langkah-langkah praktis yang bisa langsung diaplikasikan.

## 1. Membuat Project Supabase

- Daftar atau login ke https://app.supabase.com dan buat project baru.
- Catat `SUPABASE_URL` dan `SUPABASE_ANON_KEY` serta `SUPABASE_SERVICE_ROLE_KEY` (service key hanya untuk server-side dan tidak boleh disimpan di klien).

## 2. Struktur Database (Rekomendasi Schema)

Berikut schema minimal untuk fitur yang dibutuhkan: `users` (akan sebagian dikelola oleh Auth), `santri`, `blogs`, `media`, `settings`.

- users (supabase auth + profile table)
	- id: uuid (primary, dari auth.users)
	- full_name: text
	- role: text check ("admin","guest") default 'guest'
	- created_at: timestamptz default now()

- santri
	- id: uuid primary key default gen_random_uuid()
	- nis: text unique
	- full_name: text
	- kelas: text
	- angkatan: integer
	- bio: text
	- photo_url: text
	- created_at: timestamptz default now()

- blogs
	- id: uuid primary key default gen_random_uuid()
	- title: text
	- slug: text unique
	- content: text
	- excerpt: text
	- author_id: uuid references users(id) on delete set null
	- published: boolean default false
	- published_at: timestamptz
	- created_at: timestamptz default now()

- media
	- id: uuid primary key default gen_random_uuid()
	- url: text
	- filename: text
	- metadata: jsonb
	- uploaded_by: uuid references users(id)
	- created_at: timestamptz default now()

- settings
	- id: text primary key
	- value: jsonb

Contoh SQL (migrasi awal):

-- Enable pgcrypto extension for gen_random_uuid
create extension if not exists "pgcrypto";

create table if not exists santri (
	id uuid primary key default gen_random_uuid(),
	nis text unique,
	full_name text,
	kelas text,
	angkatan integer,
	bio text,
	photo_url text,
	created_at timestamptz default now()
);

create table if not exists blogs (
	id uuid primary key default gen_random_uuid(),
	title text,
	slug text unique,
	content text,
	excerpt text,
	author_id uuid references auth.users(id) on delete set null,
	published boolean default false,
	published_at timestamptz,
	created_at timestamptz default now()
);

create table if not exists media (
	id uuid primary key default gen_random_uuid(),
	url text,
	filename text,
	metadata jsonb,
	uploaded_by uuid references auth.users(id),
	created_at timestamptz default now()
);

create table if not exists settings (
	id text primary key,
	value jsonb
);

## 3. Autentikasi dan Roles

Supabase menyediakan Auth (based on GoTrue). Rekomendasi:

- Gunakan Supabase Auth untuk sign-up/login (email/password). Simpan role di `auth.users` metadata atau di table `profiles` terpisah.
- Buat trigger yang membuat row di `profiles` atau `users` setelah user terdaftar.

Contoh table profile dan trigger:

create table if not exists profiles (
	id uuid references auth.users(id) primary key,
	full_name text,
	role text default 'guest',
	created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
	insert into profiles (id, full_name) values (new.id, new.raw_user_meta->>'full_name');
	return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute function public.handle_new_user();

## 4. Row Level Security (RLS) Policies

Aktifkan RLS pada tabel sensitif seperti `santri`, `blogs`, `media`, `profiles` dan buat policy yang ketat.

Contoh kebijakan:

-- Aktifkan RLS
alter table santri enable row level security;

-- Policy untuk baca: semua authenticated user boleh read
create policy "santri_read" on santri
	for select using (auth.role() is not null);

-- Policy untuk insert/update/delete: hanya admin
create policy "santri_manage" on santri
	for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'))
	with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

Lakukan pola yang sama untuk `blogs` (publish/modify hanya admin atau author), `media` (upload hanya authenticated; delete hanya admin or owner).

## 5. Storage (Media)

Gunakan Supabase Storage untuk menyimpan foto santri dan media blog. Buat bucket publik untuk media yang boleh dibaca semua dan bucket privat bila perlu.

Rekomendasi:

- Bucket `public-media` — objek publik (gambar blog/santri). Gunakan signed URLs jika ingin mengontrol akses.
- Bucket `private-uploads` — untuk konten privat.

## 6. Migrations & Local Development

Rekomendasi workflow:

- Gunakan `supabase` CLI untuk membuat project lokal atau menjalankan migration: https://supabase.com/docs/guides/cli
- Simpan skrip SQL migrasi di repo di folder `supabase/migrations`.
- Contoh perintah (di Powershell):

```
supabase login; supabase init; supabase start
supabase db push --file supabase/migrations/001_init.sql
```

Catatan: `supabase start` memerlukan Docker.

## 7. Integrasi dengan Nuxt 4 dan Zod

Di sisi frontend (Nuxt 4), gunakan kombinasi `@supabase/supabase-js` untuk akses client dan `server` runtime untuk operasi yang memerlukan service role key.

- Install:

```
npm install @supabase/supabase-js zod
```

- Contoh inisialisasi di `./server/utils/supabase.ts` (server-side) dengan `SUPABASE_SERVICE_ROLE_KEY` dari secret env, untuk operasi administratif.

- Di client, buat plugin Nuxt untuk mensetup `supabase` dengan `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.

- Gunakan `zod` untuk validasi payload sebelum dikirim ke API (mis. validasi form tambah santri, create blog).

Contoh Zod schema (santri):

```
import { z } from 'zod';

export const SantriSchema = z.object({
	nis: z.string().min(1),
	full_name: z.string().min(1),
	kelas: z.string().optional(),
	angkatan: z.number().int().optional(),
	bio: z.string().optional(),
	photo: z.instanceof(File).optional()
});
```

Gunakan schema ini di server endpoint untuk validasi dan sanitasi.

## 8. API Patterns (Best Practices)

- Semua operasi yang memodifikasi data sensitif harus lewat server (Server Actions / API routes) yang menggunakan `SUPABASE_SERVICE_ROLE_KEY`.
- Client hanya gunakan anon key untuk membaca data publik atau operasi yang dibatasi RLS.
- Selalu validasi input dengan Zod di server dan client (double validation).

Contoh flow: Tambah Santri

1. Client mengisi form, validasi dengan Zod.
2. Upload foto ke Storage via signed upload (server) atau langsung dari client ke bucket `public-media` menggunakan supabase-js (jika anon allowed) dan dapatkan `url`.
3. Panggil API server (`/api/santri`) dengan payload santri + `photo_url`.
4. Server memvalidasi payload dengan Zod dan menyimpan ke tabel `santri` menggunakan service role key.

## 9. CMS Patterns per Module

Berikan CMS ringan untuk masing-masing modul. Pilihan: gunakan Supabase Realtime + simple admin UI di Nuxt, atau gunakan headless CMS eksternal (contoh: Strapi) jika memerlukan editor WYSIWYG lebih lengkap. Namun Supabase + Nuxt admin biasanya cukup.

Rekomendasi modul CMS:

- Blog
	- Editor: rich-text editor (ProseMirror / TipTap) di admin.
	- Field: title, slug (auto-generate), excerpt, content (rich), featured_image (media), author, published, published_at.
	- Workflow: draft -> review -> publish. Simpan sebagai `published` boolean.

- Santri
	- Form lengkap (nis, nama, kelas, angkatan, bio, photo).
	- Bulk import via CSV (endpoint server yang mem-parse CSV dan create rows).
	- Filter/search: buat index di DB dan buat endpoint dengan query params.

- Dashboard
	- Ringkasan: jumlah santri, jumlah blog (published/draft), aktivitas terbaru.
	- Charts: gunakan library client-side (Chart.js / ApexCharts) dan panggil API server yang mengembalikan aggregated data.

- Media
	- List media, search by filename, delete (only admin), and signed URL generation for downloads.

- Settings
	- Key-value store di tabel `settings`.
	- UI untuk update site title, description, contact, etc.

## 10. Backup, Monitoring, dan Security

- Backup: gunakan Supabase backup/point-in-time features or export scheduled SQL dumps.
- Monitoring: aktifkan logs dan gunakan Supabase dashboard untuk query performance.
- Security: jangan commit service role keys. Gunakan environment variables and secrets in deployment platform.

## 11. Deployment Recommendations

- Frontend: deploy Nuxt 4 ke Vercel, Netlify, atau platform yang mendukung Node (server-side serverActions). Gunakan environment variables untuk `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
- Backend: Jika butuh server-side functions (serverEndPoints) gunakan Supabase Edge Functions atau host on server (Platform with environment secrets). Edge Functions cocok untuk light server logic.

## 12. Example File & Folder Layout (repo)

```
/supabase
	/migrations
	/functions (edge functions)

/src
	/server
		/api
			santri.post.ts
			blogs.post.ts
		/utils
			supabase.server.ts
	/lib
		schemas
			santri.ts
			blog.ts
	/components
	/pages

README.md
```

## 13. Quick Checklist

- [ ] Buat project Supabase, catat keys
- [ ] Buat migration SQL dan jalankan
- [ ] Konfigurasi RLS dan policy untuk tabel sensitif
- [ ] Buat buckets storage dan policy
- [ ] Buat triggers untuk profiles
- [ ] Implement server endpoints dengan service role key
- [ ] Integrasi dengan Nuxt + Zod
- [ ] Buat admin UI untuk CMS per modul

---

Jika Anda ingin, saya akan melanjutkan dan mengisi `instructions/frontend/nuxt.guidelane.md` dengan langkah-langkah setup Nuxt 4, plugin, contoh code, dan file starter lengkap. Saya juga bisa menambahkan contoh edge function Supabase atau server endpoints di `src/server/api`.

