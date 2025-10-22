// server/api/santris/[id].put.ts
import { serverSupabase } from '../../utils/supabase'

interface UpdateSantriBody {
  full_name?: string
  address?: string
  gender?: 'male' | 'female'
  image_url?: string
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const supabase = await serverSupabase()

    // Validate ID
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID santri tidak valid'
      })
    }

    // Get request body
    const body = await readBody(event) as UpdateSantriBody

    // Validate required fields
    if (!body.full_name || !body.address) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nama lengkap dan alamat harus diisi'
      })
    }

    // Get current santri
    const { data: currentSantri, error: fetchError } = await supabase
      .from('santris')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentSantri) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Data santri tidak ditemukan'
      })
    }

    // Prepare update data
    const updateData: any = {
      full_name: body.full_name,
      address: body.address,
      gender: body.gender || currentSantri.gender,
      updated_at: new Date().toISOString()
    }

    // Only update image_url if provided
    if (body.image_url) {
      updateData.image_url = body.image_url
    }

    // Update santri
    const { data: updatedSantri, error: updateError } = await supabase
      .from('santris')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message || 'Gagal memperbarui data santri'
      })
    }

    return {
      success: true,
      data: updatedSantri,
      message: 'Data santri berhasil diperbarui'
    }
  } catch (error: any) {
    console.error('Error in PUT /api/santris/[id]:', error)
    throw error
  }
})
