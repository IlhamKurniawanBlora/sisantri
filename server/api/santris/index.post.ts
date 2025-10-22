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
    let imageUrl: string | null = null

    // --- Upload file ke bucket ---
    if (fileBuffer && fileName) {
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
      // ambil data lama dulu
      const { data: existing, error: existingError } = await supabase
        .from('santris')
        .select('image_url')
        .eq('id', body.id)
        .single()

      if (existingError) {
        throw createError({ statusCode: 404, statusMessage: 'Santri not found' })
      }

      const updateData: any = {
        nis: body.nis,
        full_name: body.full_name,
        gender: body.gender,
        address: body.address,
        birth_place_date: body.birth_place_date || null,
        phone_number: body.phone_number || null,
        nik: body.nik || null,
        no_kk: body.no_kk || null,
        nisn: body.nisn || null,
        no_kip: body.no_kip || null,
        no_pkh: body.no_pkh || null,
        no_kks: body.no_kks || null,
        rt_rw: body.rt_rw || null,
        kecamatan: body.kecamatan || null,
        kabupaten: body.kabupaten || null,
        provinsi: body.provinsi || null,
        kode_pos: body.kode_pos || null,
        pendidikan_sd: body.pendidikan_sd || null,
        pendidikan_smp: body.pendidikan_smp || null,
        pendidikan_sma: body.pendidikan_sma || null,
        pendidikan_non_formal: body.pendidikan_non_formal || null,
        hafal_quran: body.hafal_quran || null,
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
        .from('santris')
        .update(updateData)
        .eq('id', body.id)
        .select('*')
        .single()

      if (error) throw createError({ statusCode: 400, statusMessage: error.message })

      return { success: true, data, message: 'Santri updated successfully' }
    }

    // --- Create data baru ---
    const insertData: any = {
      nis: body.nis,
      full_name: body.full_name,
      gender: body.gender,
      address: body.address,
      birth_place_date: body.birth_place_date || null,
      phone_number: body.phone_number || null,
      nik: body.nik || null,
      no_kk: body.no_kk || null,
      nisn: body.nisn || null,
      no_kip: body.no_kip || null,
      no_pkh: body.no_pkh || null,
      no_kks: body.no_kks || null,
      rt_rw: body.rt_rw || null,
      kecamatan: body.kecamatan || null,
      kabupaten: body.kabupaten || null,
      provinsi: body.provinsi || null,
      kode_pos: body.kode_pos || null,
      pendidikan_sd: body.pendidikan_sd || null,
      pendidikan_smp: body.pendidikan_smp || null,
      pendidikan_sma: body.pendidikan_sma || null,
      pendidikan_non_formal: body.pendidikan_non_formal || null,
      hafal_quran: body.hafal_quran || null,
      image_url: imageUrl || body.image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('santris')
      .insert(insertData)
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
