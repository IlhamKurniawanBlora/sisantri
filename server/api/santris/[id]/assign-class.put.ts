/**
 * server/api/santris/[id]/assign-class.put.ts
 * Assign santri to a class and update profiles
 */
import { serverSupabase } from '../../../utils/supabase'

interface AssignClassBody {
  classes_id: string
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const supabase = serverSupabase()

    // Validate ID
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID santri tidak valid'
      })
    }

    // Get request body
    const body = await readBody(event) as AssignClassBody

    // Validate required fields
    if (!body.classes_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID kelas harus diisi'
      })
    }

    // Verify santri exists
    const { data: santri, error: santriError } = await supabase
      .from('santris')
      .select('id')
      .eq('id', id)
      .single()

    if (santriError || !santri) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Data santri tidak ditemukan'
      })
    }

    // Verify class exists
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', body.classes_id)
      .single()

    if (classError || !classData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Data kelas tidak ditemukan'
      })
    }

    // Update santri with class assignment
    const { data: updatedSantri, error: updateSantriError } = await supabase
      .from('santris')
      .update({
        classes_id: body.classes_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateSantriError) {
      console.error('Update santri error:', updateSantriError)
      throw createError({
        statusCode: 400,
        statusMessage: updateSantriError.message || 'Gagal mengubah kelas santri'
      })
    }

    // Update profiles.classes_id where santris_id = id
    const { data: updatedProfiles, error: updateProfilesError } = await supabase
      .from('profiles')
      .update({
        classes_id: body.classes_id,
        updated_at: new Date().toISOString()
      })
      .eq('santris_id', id)
      .select()

    if (updateProfilesError) {
      console.error('Update profiles error:', updateProfilesError)
      // Log error but don't throw - profiles update is not critical
      console.warn('⚠️ Gagal mengupdate profile santri, tapi santri sudah di-assign ke kelas')
    }

    return {
      success: true,
      data: {
        santri: updatedSantri,
        profiles: updatedProfiles || []
      },
      message: 'Santri berhasil ditambahkan ke kelas dan profile diperbarui'
    }
  } catch (error: any) {
    console.error('❌ Error in PUT /api/santris/[id]/assign-class:', error)
    throw error
  }
})
