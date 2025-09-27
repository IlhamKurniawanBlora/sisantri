// server/api/blogs/[slug].delete.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const { slug } = getRouterParams(event)

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug is required'
      })
    }

    // Soft delete: update deleted_at
    const { error } = await supabase
      .from('blogs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('slug', slug)

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to delete blog: ${error.message}`
      })
    }

    return { success: true, message: 'Blog deleted successfully' }
  } catch (err: any) {
    console.error('Delete Blog Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
