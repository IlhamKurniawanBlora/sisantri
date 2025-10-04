import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const client = serverSupabase()

  // Ambil query params (limit & page) dari URL
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10
  const page = parseInt(query.page as string) || 1
  const from = (page - 1) * limit
  const to = from + limit - 1

  try {
    // Hitung total data
    const { count: total } = await client
      .from('carousel_images')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    // Ambil data sesuai pagination
    const { data, error } = await client
      .from('carousel_images')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    }

    return {
      data: Array.isArray(data) ? data : [],
      pagination: {
        total: total || 0,
        page,
        limit,
        total_pages: total ? Math.ceil(total / limit) : 1,
      },
    }
  } catch (error: any) {
    console.error('Carousel Images Pagination Error:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Internal server error',
    })
  }
})
