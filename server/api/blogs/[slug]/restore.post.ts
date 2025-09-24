// server/api/blogs/[slug]/restore.post.ts
import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const slug = getRouterParam(event, 'slug')
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    // Find the blog (including deleted)
    const { data: blog, error: fetchError } = await supabase
      .from('blogs')
      .select('id, deleted_at')
      .eq('slug', slug)
      .single()

    if (fetchError || !blog) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blog not found'
      })
    }

    if (!blog.deleted_at) {
      return {
        success: false,
        message: 'Blog is not deleted'
      }
    }

    // Restore (set deleted_at to null)
    const { data, error } = await supabase
      .from('blogs')
      .update({ deleted_at: null, updated_at: new Date().toISOString() })
      .eq('id', blog.id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to restore blog: ${error.message}`
      })
    }

    return {
      success: true,
      data,
      message: 'Blog restored successfully'
    }
  } catch (err) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
