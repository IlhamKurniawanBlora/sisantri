# Nuxt 4 Guidelane

Panduan ini menjelaskan cara men-setup frontend aplikasi menggunakan Nuxt 4 (Nuxt Nitro), dengan manajer paket `pnpm`. Materi mencakup inisialisasi proyek, integrasi dengan `Nuxt UI 4`, `Zod`, dan `Supabase`, pola rendering (SSR / SPA hybrid), praktik SEO terbaik, modul yang direkomendasikan, dan catatan CMS per modul.

Catatan asumsi: aplikasi akan berjalan sebagai aplikasi Nuxt 4 yang mendukung SSR untuk SEO tetapi juga dapat bekerja sebagai SPA di client-side ketika diperlukan (hybrid). Paket manager yang digunakan adalah `pnpm`.

## 1. Inisialisasi project (pnpm)

Perintah singkat untuk membuat project Nuxt 4 dan menjalankan development server:

```powershell
# inisialisasi folder baru
pnpm dlx nuxi init .
pnpm install

# menjalankan development server
pnpm dev
```

Gunakan `pnpm` di semua langkah instalasi dan script di `package.json` untuk konsistensi.

## 2. Struktur dasar rekomendasi

Contoh struktur minimal untuk aplikasi:

```
/.nuxt
/public
/src
	/components
	/layouts
	/pages
	/composables
	/server
		/api
		/utils
	/lib
		/schemas (zod)
	/plugins
nuxt.config.ts
package.json
```

Letakkan kode server-side (API routes yang memerlukan service role key Supabase, validasi Zod) di `src/server/api`.

## 3. Dependensi utama (rekomendasi)

- `@supabase/supabase-js` — client untuk Supabase
- `zod` — validasi schema
- `@pinia/nuxt` — state management (opsional tapi direkomendasikan)
- `nuxt-ui` (atau Nuxt UI 4 yang relevan) — komponen UI jika dipilih
- `unhead` / `@vueuse/head` (bawaan Nuxt) — manajemen head/meta untuk SEO
- `@nuxt/image` atau `nuxt-image` — optimisasi gambar
- `prismjs` / `shiki` — jika menampilkan kode di blog
- `tiptap` / `prosemirror` — editor rich-text untuk admin blog
- `sitemap` & `robots` module (atau buat sitemap server-side)
- `pnpm` sebagai package manager

Instal contoh (pnpm):

```powershell
pnpm add @supabase/supabase-js zod @pinia/nuxt nuxt-ui @nuxt/image
```

Catatan: sesuaikan paket untuk Nuxt 4 kompatibilitas — periksa versi masing-masing module.

## 4. Konfigurasi Nuxt (highlight)

Di `nuxt.config.ts` atur hal-hal penting:

- Server target / nitro default (aktifkan SSR, atau gunakan `ssr: true`).
- Environment variables untuk `SUPABASE_URL` dan `SUPABASE_ANON_KEY`.
- Module yang dipakai, plugin untuk supabase, integrasi Pinia.

Contoh snippet konfigurasi:

```ts
export default defineNuxtConfig({
	ssr: true, // gunakan SSR untuk SEO; still supports SPA navigation
	modules: [
		'@pinia/nuxt',
		// 'nuxt-ui',
		// '@nuxt/image',
	],
	runtimeConfig: {
		public: {
			supabaseUrl: process.env.SUPABASE_URL,
			supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
		},
		supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY // server-only
	}
});
```

## 5. Plugin Supabase (client) dan util server

- Buat plugin client `~/plugins/supabase.client.ts` menggunakan public keys (anon key) untuk operasi aman yang tunduk RLS.
- Buat util server `~/server/utils/supabase.server.ts` yang memakai `SUPABASE_SERVICE_ROLE_KEY` dari `runtimeConfig` untuk admin operations (create santri, publish blog).

Contoh inisialisasi singkat (conceptual):

```ts
// plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()
	const supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
	return { provide: { supabase } }
})

// server/utils/supabase.server.ts
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
```

Perhatikan: jangan mengekspos `SUPABASE_SERVICE_ROLE_KEY` ke klien.

## 6. Zod: schema & validasi

- Letakkan semua schema Zod di `src/lib/schemas`.
- Gunakan Zod untuk validasi input di client (UX friendly) dan selalu ulangi validasi di server (keamanan).

Contoh schema sederhana untuk blog:

```ts
// src/lib/schemas/blog.ts
import { z } from 'zod'

export const BlogSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1),
	excerpt: z.string().optional(),
	content: z.string().min(1),
	published: z.boolean().optional()
})

export type BlogInput = z.infer<typeof BlogSchema>
```

## 7. Routing & Pages (SEO + SSR)

- Gunakan dynamic routes (`/blog/[slug].vue`) dan gunakan `useHead` atau `definePageMeta` untuk men-setup meta tags dinamis (title, description, canonical, og:image).
- Pastikan setiap artikel/blog memiliki `title`, `description/excerpt`, `featured_image` dan `published_at` untuk SEO.
- Pre-render atau generate sitemap dari server endpoint yang membaca semua blog yang published.

Contoh penggunaan `useHead`:

```ts
const blog = await useAsyncData('blog', () => $fetch('/api/blogs/' + slug))
useHead({
	title: blog.value.title,
	meta: [
		{ name: 'description', content: blog.value.excerpt }
	]
})
```

## 8. SEO Best Practices

- SSR: gunakan SSR untuk public pages (blog detail, home, santri listing) sehingga search engine bisa mengindeks konten langsung.
- Meta tags: title, meta description, canonical, open graph, twitter card.
- Structured Data: tambahkan JSON-LD untuk `Article` pada blog pages.
- Sitemap & robots: sediakan `sitemap.xml` yang di-generate oleh server (cron or on-demand) dan `robots.txt`.
- Image optimization: gunakan `@nuxt/image` atau servis CDN untuk resize/optimized images.
- Accessibility: pastikan semantic HTML dan alt attributes.

## 9. Performance & Best Practices

- Critical CSS & lazy load assets.
- Use browser caching for static assets and CDN for image/media.
- Split chunks and optimize bundle size using `unplugin-auto-import` and component auto-importing.
- Use Nitro caching or ISR-like strategies for pages that tidak sering berubah (e.g., blog listing) jika perlu.

## 10. Deployment (pnpm)

Deploy Nuxt 4 ke platform seperti Vercel, Netlify, or a Node hosting that supports Nitro server. Jika ingin edge capabilities, gunakan platforms that support Nitro or use serverless/edge functions.

Contoh scripts di `package.json`:

```json
{
	"scripts": {
		"dev": "nuxi dev",
		"build": "nuxi build",
		"preview": "nuxi preview",
		"lint": "eslint . --ext .ts,.vue"
	}
}
```

Gunakan environment variables di deployment platform: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` (server-only).

## 11. CMS: Best Practices per Module (Catatan)

Berikut catatan CMS untuk setiap module agar mudah dipahami dan diimplementasikan:

- Blog
	- Fields: `title`, `slug`, `excerpt`, `content (rich)`, `featured_image`, `author`, `meta_title`, `meta_description`, `tags`, `published`, `published_at`.
	- Workflow: draft -> review -> publish. Simpan versi draft terpisah (menggunakan `status: draft|published`) jika ingin history.
	- SEO: tambahkan `meta_title` dan `meta_description`; generate `sitemap` dan gunakan `og` fields.
	- Editor: gunakan TipTap/ProseMirror dan simpan content sebagai HTML atau Markdown.

- Santri
	- Fields: `nis`, `full_name`, `kelas`, `angkatan`, `bio`, `photo_url`, `contact` (opsional).
	- Bulk import: sediakan import CSV di admin (server endpoint yang mem-validate dengan Zod).
	- Search & Filter: sediakan indexing di DB dan endpoint search (pagination).
	- Privacy: pastikan data privat disimpan sesuai kebijakan; foto pribadi bisa di-bucket privat bila perlu.

- Dashboard
	- Kebutuhan: aggregate counts (jumlah santri, blog), recent activities, grafik.
	- Data sumber: buat endpoint yang melakukan aggregation (count, group by) agar client tidak memproses banyak data.

- Media
	- Bucket: `public-media` (untuk gambar publik), `private-uploads` (untuk file privat).
	- Fields: `filename`, `url`, `uploaded_by`, `metadata`.
	- Fitur: search, delete (only admin), signed URLs untuk private downloads.

- Authentication & Profiles
	- Gunakan Supabase Auth.
	- Simpan profile di tabel `profiles` terpisah (sync via trigger) dan kelola `role` di sana.
	- Two-step login for admin (MFA) jika diperlukan.

- Settings
	- Key-value store, mudah diupdate dari admin panel.
	- Cache di CDN atau server memory untuk performance.

## 12. CMS UX Notes (non-technical untuk admin users)

- Buat tampilan admin sederhana dan fokus: list -> detail -> edit.
- Sediakan preview untuk blog (preview page yang tidak di-index) sehingga editor bisa melihat hasil sebelum publish.
- Untuk santri, sediakan validasi form yang jelas (field required, format NIS) dan kemampuan undo pada operasi penting.

## 13. Security Notes

- Jangan commit secrets.
- Gunakan RLS di Supabase dan pastikan client hanya dapat melakukan apa yang diizinkan.
- Server endpoints menggunakan `SUPABASE_SERVICE_ROLE_KEY` disimpan di server.

## 14. Next steps / Artefak yang bisa saya buat untuk Anda

- Starter `nuxt.config.ts` yang sudah terkonfigurasi.
- Contoh plugin `supabase.client.ts` dan `supabase.server.ts`.
- Contoh API route `src/server/api/santri.post.ts` dengan validasi Zod.
- Contoh admin UI page untuk Blog dan Santri.

Jika Anda ingin, saya bisa melanjutkan dengan membuat artefak-artefak tersebut (starter files + contoh endpoint). Beri tahu mana yang mau saya buat lebih dulu.

