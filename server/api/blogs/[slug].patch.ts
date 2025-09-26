// server/api/blogs/[slug].put.ts
import type { MultiPartData } from 'h3'

interface BlogUpdatePayload {
  id?: string
  title?: string
  slug?: string
  description?: string
  content?: string
  category?: string
  tags?: string[]
  image_url?: string
}

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')
    
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug parameter is required'
      })
    }

    // Handle multipart form data for file upload
    const contentType = getHeader(event, 'content-type') || ''
    let body: BlogUpdatePayload
    let file: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await readMultipartFormData(event)
      body = {} as BlogUpdatePayload
      
      if (!formData) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No form data received'
        })
      }
      
      formData.forEach((item: MultiPartData) => {
        if (item.name === 'file' && item.data && item.filename) {
          // Handle file upload
          file = new File([item.data], item.filename, {
            type: item.type || 'image/jpeg'
          })
        } else if (item.name === 'tags' && item.data) {
          try {
            const tagsString = item.data.toString()
            body.tags = tagsString ? JSON.parse(tagsString) : []
          } catch (error) {
            console.warn('Failed to parse tags:', error)
            body.tags = []
          }
        } else if (item.data && item.name) {
          const value = item.data.toString().trim()
          if (value) {
            (body as any)[item.name] = value
          }
        }
      })
    } else {
      body = await readBody(event)
    }

    // Initialize Supabase client
    const supabase = await serverSupabaseClient(event)

    // Get current user
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // First, get the existing blog to check ownership
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('id, author_id, slug, image_url')
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

    // Check ownership
    if (existingBlog.author_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Unauthorized to update this blog'
      })
    }

    // Handle file upload if present
    let imageUrl = body.image_url || existingBlog.image_url || ''
    if (file) {
      try {
        // Create unique filename
        const fileExtension = file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${existingBlog.slug}.${fileExtension}`
        
        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blogs')
          .upload(fileName, arrayBuffer, {
            contentType: file.type,
            upsert: false
          })

        if (uploadError) {
          console.error('File upload error:', uploadError)
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to upload image: ${uploadError.message}`
          })
        }

        const { data } = supabase.storage
          .from('blogs')
          .getPublicUrl(uploadData.path)
        
        imageUrl = data.publicUrl

        // Delete old image if it exists and is different
        if (existingBlog.image_url && existingBlog.image_url !== imageUrl) {
          try {
            const oldImagePath = existingBlog.image_url.split('/').pop()
            if (oldImagePath) {
              await supabase.storage
                .from('blogs')
                .remove([oldImagePath])
            }
          } catch (error) {
            console.warn('Failed to delete old image:', error)
          }
        }
      } catch (error) {
        console.error('File processing error:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to process uploaded file'
        })
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (body.title?.trim()) {
      updateData.title = body.title.trim()
    }

    if (body.description?.trim()) {
      updateData.description = body.description.trim()
    }

    if (body.content?.trim()) {
      updateData.content = body.content.trim()
    }

    if (body.category) {
      updateData.category = body.category
    }

    if (Array.isArray(body.tags)) {
      updateData.tags = body.tags
    }

    if (imageUrl) {
      updateData.image_url = imageUrl
    }

    // Handle slug update
    if (body.slug && body.slug !== existingBlog.slug) {
      const sanitizedSlug = body.slug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')

      if (!sanitizedSlug) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid slug format'
        })
      }
      
      // Check if new slug already exists
      const { data: slugExists } = await supabase
        .from('blogs')
        .select('id')
        .eq('slug', sanitizedSlug)
        .is('deleted_at', null)
        .neq('id', existingBlog.id)
        .single()

      if (slugExists) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Blog with this slug already exists'
        })
      }

      updateData.slug = sanitizedSlug
    }

    // Validate required fields if they're being updated
    if ('title' in updateData && !updateData.title) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title is required'
      })
    }

    if ('description' in updateData && !updateData.description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Description is required'
      })
    }

    if ('content' in updateData && !updateData.content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content is required'
      })
    }

    // Update the blog
    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', existingBlog.id)
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

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error('Blog update API error:', error)
    
    // If it's already a createError, just throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
})