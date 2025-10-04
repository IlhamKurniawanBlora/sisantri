import { serverSupabase } from '../../../utils/supabase'

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

    const { error } = await supabase
      .from('blogs')
      .update({ deleted_at: null })
      .eq('slug', slug)

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to restore berita: ${error.message}`
      })
    }

    return { success: true, message: 'Berita restored successfully' }
  } catch (err: any) {
    console.error('Restore Berita Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
