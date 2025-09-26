// server/api/santris/index.post.ts
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
        } else if (item.name) {
          body[item.name] = item.data.toString()
        }
      })
    } else {
      body = await readBody(event)
    }

    const supabase = await serverSupabase()
    let imageUrl = body.image_url || ''

    // --- Upload file ke bucket ---
    if (fileBuffer && fileName) {
      // kalau ada id, simpan di folder id
      const ext = fileName.split('.').pop()
      const safeName = body.full_name
        ?.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'santri'

      const folderId = body.id || `temp-${Date.now()}`
      const newFileName = `${Date.now()}-${safeName}.${ext}`
      const filePath = `${folderId}/${newFileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('santris')
        .upload(filePath, fileBuffer, {
          contentType: fileType || 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        throw createError({ statusCode: 500, statusMessage: `Upload error: ${uploadError.message}` })
      }

      const { data } = supabase.storage.from('santris').getPublicUrl(uploadData.path)
      imageUrl = data.publicUrl
    }

    // --- Update data ---
    if (body.id) {
      const { data, error } = await supabase
        .from('santris')
        .update({
          nis: body.nis,
          full_name: body.full_name,
          address: body.address,
          gender: body.gender,
          image_url: imageUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', body.id)
        .select('*')
        .single()

      if (error) throw createError({ statusCode: 400, statusMessage: error.message })

      return { success: true, data }
    }

    // --- Create data baru ---
    const { data, error } = await supabase
      .from('santris')
      .insert({
        nis: body.nis,
        full_name: body.full_name,
        address: body.address,
        gender: body.gender,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) throw createError({ statusCode: 400, statusMessage: error.message })

    return { success: true, data, message: 'Santri created successfully' }
  } catch (error: any) {
    console.error('Santri API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
