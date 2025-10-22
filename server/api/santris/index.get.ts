// server/api/santris/index.get.ts
import { serverSupabase } from '../../utils/supabase'

interface SantriQuery {
  page?: number | string
  limit?: number | string
  search?: string
  gender?: 'male' | 'female' | 'all'
  includeDeleted?: boolean | string | number
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const query = getQuery(event) as SantriQuery

    // Extract & normalize query
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search
    const gender = query.gender

    // Pastikan includeDeleted jadi boolean
    const includeDeleted = (
      query.includeDeleted === true ||
      query.includeDeleted === 'true' ||
      query.includeDeleted === 1 ||
      query.includeDeleted === '1'
    )

    let supabaseQuery = supabase
      .from('santris')
      .select('*', { count: 'exact' })
      .not('accepted_at', 'is', null)

    // Hanya ambil yang belum dihapus jika includeDeleted = false
    if (!includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    // Filter pencarian
    if (search) {
      supabaseQuery = supabaseQuery.or(
        `full_name.ilike.%${search}%,nis.ilike.%${search}%,address.ilike.%${search}%`
      )
    }

    // Filter gender
    if (gender && gender !== 'all') {
      supabaseQuery = supabaseQuery.eq('gender', gender)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    supabaseQuery = supabaseQuery
      .range(from, to)
      .order('created_at', { ascending: false })

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch santris: ${error.message}`
      })
    }

    return {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
