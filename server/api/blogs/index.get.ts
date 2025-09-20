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
      includeDeleted = false
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

    if (!includeDeleted) {
      supabaseQuery = supabaseQuery.is('deleted_at', null)
    }

    if (search) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`
      )
    }

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category)
    }

    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim())
      supabaseQuery = supabaseQuery.overlaps('tags', tagArray)
    }

    if (author_id) {
      supabaseQuery = supabaseQuery.eq('author_id', author_id)
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
        statusMessage: `Failed to fetch blogs: ${error.message}`
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
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
