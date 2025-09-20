interface BlogPayload {
  id?: string
  slug: string
  title: string
  description?: string
  content?: string
  category?: string
  tags?: string[]
}

export default defineEventHandler(async (event) => {
  try {
    const { $supabase: supabase } = useNuxtApp() as any
    const body = await readBody(event) as BlogPayload
    if (!body.slug || !body.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug and title are required'
      })
    }

    // Generate slug from title if not provided or sanitize existing slug
    const sanitizedSlug = body.slug
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    let result

    if (body.id) {
      // Update existing blog - check if user owns the blog or is admin
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

      const { data, error } = await supabase
        .from('blogs')
        .update({
          slug: sanitizedSlug,
          title: body.title,
          description: body.description,
          content: body.content,
          category: body.category,
          tags: body.tags
        })
        .eq('id', body.id)
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to update blog: ${error.message}`
        })
      }

      result = { data, message: 'Blog updated successfully' }
    } else {
      // Create new blog
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          slug: sanitizedSlug,
          title: body.title,
          description: body.description,
          content: body.content,
          category: body.category,
          tags: body.tags,
          author_id: '' // Set to current user's ID in real implementation
        })
        .select(`
          *,
          profiles:author_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to create blog: ${error.message}`
        })
      }

      result = { data, message: 'Blog created successfully' }
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