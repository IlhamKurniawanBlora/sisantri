// server/api/registrants/index.get.ts
import { serverSupabase } from '../../utils/supabase'

interface RegistrantQuery {
  page?: number | string
  limit?: number | string
  search?: string
  gender?: 'male' | 'female' | 'all'
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabase()
    const query = getQuery(event) as RegistrantQuery

    // Extract & normalize query
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search
    const gender = query.gender
    const sortBy = query.sortBy || 'newest'

    let supabaseQuery = supabase
      .from('santris')
      .select('*', { count: 'exact' })
      .is('accepted_at', null) // Filter hanya yang belum diterima

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

    // Sort
    if (sortBy === 'oldest') {
      supabaseQuery = supabaseQuery.order('created_at', { ascending: true })
    } else if (sortBy === 'name_asc') {
      supabaseQuery = supabaseQuery.order('full_name', { ascending: true })
    } else if (sortBy === 'name_desc') {
      supabaseQuery = supabaseQuery.order('full_name', { ascending: false })
    } else {
      // newest (default)
      supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    supabaseQuery = supabaseQuery.range(from, to)

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch registrants: ${error.message}`
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
