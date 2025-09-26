// server/api/blogs/index.post.ts
import type { MultiPartData } from 'h3'
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const contentType = getHeader(event, 'content-type') || ''
    let body: any = {}
    let fileBuffer: Buffer | null = null
    let fileName: string | null = null
    let fileType: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await readMultipartFormData(event)
      if (!formData) {
        throw createError({ statusCode: 400, statusMessage: 'No form data received' })
      }

      formData.forEach((item: MultiPartData) => {
        if (item.name === 'file' && item.data && item.filename) {
          fileBuffer = Buffer.from(item.data)
          fileName = item.filename
          fileType = item.type || 'image/jpeg'
        } else if (item.name === 'tags') {
          try {
            body.tags = JSON.parse(item.data.toString())
          } catch {
            body.tags = []
          }
        } else if (item.name) {
          body[item.name] = item.data.toString()
        }
      })
    } else {
      body = await readBody(event)
    }

    const supabase = await serverSupabase()
    const slug = body.slug?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    let imageUrl = body.image_url || ''

    // Upload file jika ada
    if (fileBuffer && fileName) {
      const ext = fileName.split('.').pop()
      const newFileName = `${Date.now()}-${slug}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(newFileName, fileBuffer, {
          contentType: fileType || 'image/jpeg',
          upsert: false
        })

      if (uploadError) {
        throw createError({ statusCode: 500, statusMessage: `Upload error: ${uploadError.message}` })
      }

      const { data } = supabase.storage.from('blogs').getPublicUrl(uploadData.path)
      imageUrl = data.publicUrl
    }

    // Update
    if (body.id) {
      const { data, error } = await supabase
        .from('blogs')
        .update({
          slug,
          title: body.title,
          description: body.description,
          content: body.content,
          category: body.category || 'akademik',
          tags: Array.isArray(body.tags) ? body.tags : [],
          image_url: imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.id)
        .select('*')
        .single()

      if (error) throw createError({ statusCode: 400, statusMessage: error.message })

      return { success: true, data }
    }

    // Create
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        slug,
        title: body.title,
        description: body.description,
        content: body.content,
        category: body.category || 'akademik',
        tags: Array.isArray(body.tags) ? body.tags : [],
        image_url: imageUrl
      })
      .select('*')
      .single()

    if (error) throw createError({ statusCode: 400, statusMessage: error.message })

    return { success: true, data, message: 'Blog created successfully' }

  } catch (error: any) {
    console.error('Blog API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
