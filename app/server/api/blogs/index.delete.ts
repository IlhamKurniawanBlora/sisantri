interface DeleteBlogPayload {
  id: string
  permanent?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const { $supabase: supabase } = useNuxtApp() as any
    const body = await readBody(event) as DeleteBlogPayload

    if (!body.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Blog ID is required'
      })
    }

    // Check if user owns the blog or is admin
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', body.id)
      .single()

    if (fetchError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Blog not found'
      })
    }

    let result

    if (body.permanent) {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', body.id)

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to delete blog permanently: ${error.message}`
        })
      }

      result = { message: 'Blog deleted permanently' }
    } else {
      // Soft delete using the utility function
      const { data, error } = await supabase.rpc('soft_delete_blog', {
        blog_id: body.id
      })

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to delete blog: ${error.message}`
        })
      }

      if (!data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Blog not found or already deleted'
        })
      }

      result = { message: 'Blog soft deleted successfully' }
    }

    return {
      success: true,
      ...result
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})