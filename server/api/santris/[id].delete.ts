// server/api/blogs/[slug].delete.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const slug = getRouterParam(event, 'slug')
    const query = getQuery(event)
    const forceDelete = query.force === 'true'

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    // First, get the existing blog to check ownership
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('id, author_id, title')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Blog not found'
        })
      }
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch blog: ${fetchError.message}`
      })
    }

    // TODO: Add authentication check here
    // const user = await getCurrentUser(event)
    // if (existingBlog.author_id !== user.id) {
    //   throw createError({
    //     statusCode: 403,
    //     statusMessage: 'Unauthorized to delete this blog'
    //   })
    // }

    let data, error

    if (forceDelete) {
      // Permanently delete the blog
      const result = await supabase
        .from('blogs')
        .delete()
        .eq('id', existingBlog.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Soft delete - set deleted_at timestamp
      const result = await supabase
        .from('blogs')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBlog.id)
        .select()
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to delete blog: ${error.message}`
      })
    }

    return {
      success: true,
      data,
      message: forceDelete 
        ? 'Blog permanently deleted successfully' 
        : 'Blog moved to trash successfully'
    }
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})