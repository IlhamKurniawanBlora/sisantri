import { serverSupabase } from '../../utils/supabase'

interface BlogQuery {
  page?: number | string
  limit?: number | string
  search?: string
  category?: string
  tags?: string
  author_id?: string
  includeDeleted?: boolean | string | number
  sortBy?: 'newest' | 'oldest' | 'title_asc' | 'title_desc'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const query = getQuery(event) as BlogQuery

    // ✅ Default pagination & parsing
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.max(1, Number(query.limit) || 10)
    const from = (page - 1) * limit
    const to = from + limit - 1

    // ✅ Filters
    const search = query.search?.trim() || ''
    const category = query.category?.trim() || ''
    const author_id = query.author_id?.trim() || ''
    const sortBy = query.sortBy || 'newest'
    const includeDeleted =
      query.includeDeleted === true ||
      query.includeDeleted === 'true' ||
      query.includeDeleted === 1 ||
      query.includeDeleted === '1'

    let supabaseQuery = supabase
      .from('blogs')
      .select(
        `
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url
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
        `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    // ✅ Category
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    // ✅ Tags (array field)
    if (query.tags) {
      const tagArray = query.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((t) => t.length > 0)
      if (tagArray.length > 0) {
        supabaseQuery = supabaseQuery.overlaps('tags', tagArray)
      }
    }

    // ✅ Author filter
    if (author_id) {
      supabaseQuery = supabaseQuery.eq('author_id', author_id)
    }

    // ✅ Sorting
    switch (sortBy) {
      case 'oldest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: true })
        break
      case 'title_asc':
        supabaseQuery = supabaseQuery.order('title', { ascending: true })
        break
      case 'title_desc':
        supabaseQuery = supabaseQuery.order('title', { ascending: false })
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
        statusMessage: `Gagal mengambil data Berita: ${error.message}`
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
        category: category || null,
        tags: query.tags || null,
        author_id: author_id || null,
        sortBy,
        includeDeleted
      }
    }
  } catch (err: any) {
    console.error('❌ Berita API Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
