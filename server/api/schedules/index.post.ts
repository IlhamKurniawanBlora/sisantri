import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const supabase = await serverSupabase()

    // Validasi required fields
    if (!body.name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nama jadwal wajib diisi'
      })
    }

    if (!body.start_at || !body.end_at) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Waktu mulai dan waktu selesai wajib diisi'
      })
    }

    // Validasi format tanggal
    const startAt = new Date(body.start_at)
    const endAt = new Date(body.end_at)

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Format tanggal tidak valid'
      })
    }

    if (startAt >= endAt) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Waktu mulai harus lebih awal dari waktu selesai'
      })
    }

    // Update existing schedule
    if (body.id) {
      const { data: existing, error: existingError } = await supabase
        .from('schedules')
        .select('id')
        .eq('id', body.id)
        .single()

      if (existingError) {
        throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })
      }

      const updateData = {
        name: body.name,
        description: body.description || null,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('schedules')
        .update(updateData)
        .eq('id', body.id)
        .select(`
          *,
          classes (
            id,
            name,
            image_url
          )
        `)
        .single()

      if (error) throw createError({ statusCode: 400, statusMessage: error.message })

      return { success: true, data, message: 'Schedule updated successfully' }
    }

    // Create new schedule
    const insertData = {
      name: body.name,
      description: body.description || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('schedules')
      .insert(insertData)
      .select(`
        *,
        classes (
          id,
          name,
          image_url
        )
      `)
      .single()

    if (error) throw createError({ statusCode: 400, statusMessage: error.message })

    return { success: true, data, message: 'Schedule created successfully' }

  } catch (error: any) {
    console.error('Schedules API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})