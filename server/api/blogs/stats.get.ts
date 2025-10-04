import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabase()

  // Hitung total semua berita
  const { count: total } = await client
    .from('blogs')
    .select('*', { count: 'exact', head: true })

  // Hitung total aktif (belum dihapus)
  const { count: active } = await client
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Hitung total tidak aktif (sudah dihapus)
  const { count: inactive } = await client
    .from('blogs')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null)

  // Ambil semua kategori unik
  const { data: categoriesData, error: catError } = await client
    .from('blogs')
    .select('category')
    .is('deleted_at', null)

  if (catError) throw createError({ statusCode: 500, statusMessage: catError.message })

  const categories = new Set(categoriesData?.map((b) => b.category)).size

  return {
    total: total || 0,
    active: active || 0,
    inactive: inactive || 0,
    categories: categories || 0,
  }
})
