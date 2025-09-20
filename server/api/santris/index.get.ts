import { serverSupabase } from '../../utils/supabase'

interface SantriQuery {
  page?: number
  limit?: number
  search?: string
  gender?: 'male' | 'female'
  includeDeleted?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()

    const query = getQuery(event) as SantriQuery
    const {
      page = 1,
      limit = 10,
      search,
      gender,
      includeDeleted = false
    } = query

    let supabaseQuery = supabase
      .from('santris')
      .select('*', { count: 'exact' })

    if (!includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    if (search) {
      supabaseQuery = supabaseQuery.or(`full_name.ilike.%${search}%,nis.ilike.%${search}%,address.ilike.%${search}%`)
    }

    if (gender) {
      supabaseQuery = supabaseQuery.eq('gender', gender)
    }

    const from = (Number(page) - 1) * Number(limit)
    const to = from + Number(limit) - 1

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
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})