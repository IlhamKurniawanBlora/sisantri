import { serverSupabase } from '../../utils/supabase'

interface ScheduleQuery {
  page?: number | string
  limit?: number | string
  search?: string
  date?: string
  classesId?: string
  includeDeleted?: boolean | string | number
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'start_time' | 'end_time'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const query = getQuery(event) as ScheduleQuery

    // ✅ Default pagination & parsing
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const from = (page - 1) * limit
    const to = from + limit - 1

    // ✅ Filters
    const search = query.search?.trim() || ''
    const date = query.date?.trim() || ''
    const classesId = query.classesId?.trim() || ''
    const sortBy = query.sortBy || 'newest'
    const includeDeleted =
      query.includeDeleted === true ||
      query.includeDeleted === 'true' ||
      query.includeDeleted === 1 ||
      query.includeDeleted === '1'

    let supabaseQuery = supabase
      .from('schedules')
      .select(
        `
        *,
        classes (
          id,
          name,
          image_url
        )
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
        `name.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    // ✅ Date filter (untuk jadwal pada tanggal tertentu)
    if (date) {
      const startDate = new Date(date + 'T00:00:00Z')
      const endDate = new Date(date + 'T23:59:59Z')
      supabaseQuery = supabaseQuery
        .gte('start_at', startDate.toISOString())
        .lte('start_at', endDate.toISOString())
    }

    // ✅ Classes filter (untuk jadwal yang terhubung dengan kelas tertentu)
    if (classesId) {
      supabaseQuery = supabaseQuery.contains('classes', { id: classesId })
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
      case 'start_time':
        supabaseQuery = supabaseQuery.order('start_at', { ascending: true })
        break
      case 'end_time':
        supabaseQuery = supabaseQuery.order('end_at', { ascending: true })
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
        statusMessage: `Gagal mengambil data Jadwal: ${error.message}`
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
        date: date || null,
        classesId: classesId || null,
        sortBy,
        includeDeleted
      }
    }
  } catch (err: any) {
    console.error('❌ Schedules API Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})