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

    // --- Parse body & file ---
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

    // --- Buat slug aman ---
    const slug = body.slug?.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'blog'

    let imageUrl: string | null = null

    // --- Upload file ke bucket ---
    if (fileBuffer && fileName) {
      const ext = fileName.split('.').pop()
      const folderId = body.id || `temp-${Date.now()}`
      const newFileName = `${Date.now()}-${slug}.${ext}`
      const filePath = `${folderId}/${newFileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(filePath, fileBuffer, {
          contentType: fileType || 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        throw createError({ statusCode: 500, statusMessage: `Upload error: ${uploadError.message}` })
      }

      const { data } = supabase.storage.from('blogs').getPublicUrl(uploadData.path)
      imageUrl = data.publicUrl
    }

    // --- Update data ---
    if (body.id) {
      // ambil data lama
      const { data: existing, error: existingError } = await supabase
        .from('blogs')
        .select('image_url')
        .eq('id', body.id)
        .single()

      if (existingError) {
        throw createError({ statusCode: 404, statusMessage: 'Berita not found' })
      }

      const updateData: any = {
        slug,
        title: body.title,
        description: body.description,
        content: body.content,
        category: body.category || 'akademik',
        tags: Array.isArray(body.tags) ? body.tags : [],
        updated_at: new Date().toISOString()
      }

      // atur image_url
      if (imageUrl) {
        updateData.image_url = imageUrl
      } else if (body.image_url) {
        updateData.image_url = body.image_url
      } else {
        updateData.image_url = existing.image_url
      }

      const { data, error } = await supabase
        .from('blogs')
        .update(updateData)
        .eq('id', body.id)
        .select('*')
        .single()

      if (error) throw createError({ statusCode: 400, statusMessage: error.message })

      return { success: true, data, message: 'Berita updated successfully' }
    }

    // --- Create data baru ---
    const insertData: any = {
      slug,
      title: body.title,
      description: body.description,
      content: body.content,
      category: body.category || 'akademik',
      tags: Array.isArray(body.tags) ? body.tags : [],
      image_url: imageUrl || body.image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blogs')
      .insert(insertData)
      .select('*')
      .single()

    if (error) throw createError({ statusCode: 400, statusMessage: error.message })

    return { success: true, data, message: 'Berita created successfully' }

  } catch (error: any) {
    console.error('Berita API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
