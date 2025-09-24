// server/api/blogs/[slug].patch.ts
import { serverSupabase } from '../../utils/supabase'

interface BlogUpdateData {
  title?: string
  description?: string
  content?: string
  image?: string
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  featured?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const slug = getRouterParam(event, 'slug')
    const body = await readBody(event) as BlogUpdateData

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    // First, get the existing blog to check ownership
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('id, author_id, slug')
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
    //     statusMessage: 'Unauthorized to update this blog'
    //   })
    // }

    // Prepare update data
    const updateData: any = {
      ...body,
      updated_at: new Date().toISOString()
    }

    // If title is being updated, generate new slug
    if (body.title && body.title !== existingBlog.title) {
      const newSlug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Check if new slug already exists
      const { data: slugExists } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', existingBlog.id)
        .single()

      if (slugExists) {
        updateData.slug = `${newSlug}-${Date.now()}`
      } else {
        updateData.slug = newSlug
      }
    }

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', existingBlog.id)
      .select(
        `
        *,
        profiles:author_id (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .single()

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to update blog: ${error.message}`
      })
    }

    return {
      success: true,
      data,
      message: 'Blog updated successfully'
    }
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})