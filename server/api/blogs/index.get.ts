// server/api/blogs/index.get.ts
import { serverSupabase } from '../../utils/supabase'

interface BlogQuery {
  page?: number
  limit?: number
  search?: string
  category?: string
  tags?: string
  author_id?: string
  includeDeleted?: boolean
  sortBy?: 'newest' | 'oldest' | 'title_asc' | 'title_desc'
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const query = getQuery(event) as BlogQuery

    const {
      page = 1,
      limit = 10,
      search,
      category,
      tags,
      author_id,
      includeDeleted = false,
      sortBy = 'newest'
    } = query

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

    // Filter non-deleted records by default
    if (!includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    // Search functionality
    if (search) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    // Category filter
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim())
      supabaseQuery = supabaseQuery.overlaps('tags', tagArray)
    }

    // Author filter
    if (author_id) {
      supabaseQuery = supabaseQuery.eq('author_id', author_id)
    }

    // Pagination
    const from = (Number(page) - 1) * Number(limit)
    const to = from + Number(limit) - 1
    supabaseQuery = supabaseQuery.range(from, to)

    // Sorting
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
      case 'newest':
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false })
        break
    }

    const { data, error, count } = await supabaseQuery

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch blogs: ${error.message}`
      })
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      },
      filters: {
        search: search || null,
        category: category || null,
        tags: tags || null,
        author_id: author_id || null,
        sortBy
      }
    }
  } catch (err: any) {
    console.error('Blog API Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})