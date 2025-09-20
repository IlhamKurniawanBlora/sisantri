// Santri Types
export interface Santri {
  nis: string
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  asal_alamat: string
  pendidikan_terakhir: string
  foto?: string
  created_at?: string
  updated_at?: string
}

// Blog Post Types
export interface BlogPost {
  slug: string
  judul: string
  deskripsi: string
  konten: string
  kategori: 'pengumuman' | 'kegiatan' | 'prestasi' | 'lainnya'
  tags?: string[]
  gambar?: string
  tanggal_publikasi: string
  created_at?: string
  updated_at?: string
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form Types
export interface SantriForm {
  nama_lengkap: string
  tempat_lahir: string
  tanggal_lahir: string
  jenis_kelamin: 'L' | 'P'
  asal_alamat: string
  pendidikan_terakhir: string
  foto?: File | string
}

export interface BlogPostForm {
  judul: string
  deskripsi: string
  konten: string
  kategori: 'pengumuman' | 'kegiatan' | 'prestasi' | 'lainnya'
  tags?: string[]
  gambar?: File | string
}

// Filter Types
export interface SantriFilters {
  search?: string
  jenis_kelamin?: 'L' | 'P' | 'semua'
  asal_alamat?: string
}

export interface BlogFilters {
  search?: string
  kategori?: 'pengumuman' | 'kegiatan' | 'prestasi' | 'lainnya' | 'semua'
  tags?: string[]
  tanggal_mulai?: string
  tanggal_akhir?: string
}

// UI Component Types
export interface NavigationItem {
  name: string
  href: string
  icon?: string
  current?: boolean
}

export interface StatsItem {
  label: string
  value: string | number
  change?: number
  changeType?: 'increase' | 'decrease'
}

export interface FeatureItem {
  title: string
  description: string
  icon: string
}

// Error Types
export interface AppError {
  message: string
  code?: string
  statusCode?: number
}