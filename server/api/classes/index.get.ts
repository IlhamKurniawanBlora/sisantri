import { serverSupabase } from '../../utils/supabase'

interface ClassQuery {
  page?: number | string
  limit?: number | string
  search?: string
  includeDeleted?: boolean | string | number
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const query = getQuery(event) as ClassQuery

    // ✅ Default pagination & parsing
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const from = (page - 1) * limit
    const to = from + limit - 1

    // ✅ Filters
    const search = query.search?.trim() || ''
    const sortBy = query.sortBy || 'newest'
    const includeDeleted =
      query.includeDeleted === true ||
      query.includeDeleted === 'true' ||
      query.includeDeleted === 1 ||
      query.includeDeleted === '1'

    let supabaseQuery = supabase
      .from('classes')
      .select(
        `
        *
        `,
        { count: 'exact' }
      )

    // ✅ Filter deleted data
    if (!includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    // ✅ Search
    if (search) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${search}%`
      )
    }

    // ✅ Sorting
    switch (sortBy) {
      case 'oldest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: true })
        break
      case 'name_asc':
        supabaseQuery = supabaseQuery.order('name', { ascending: true })
        break
      case 'name_desc':
        supabaseQuery = supabaseQuery.order('name', { ascending: false })
        break
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
    }

    // ✅ Range for pagination
    supabaseQuery = supabaseQuery.range(from, to)

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Gagal mengambil data Kelas: ${error.message}`
      })
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        search: search || null,
        sortBy,
        includeDeleted
      }
    }
  } catch (err: any) {
    console.error('❌ Classes API Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})