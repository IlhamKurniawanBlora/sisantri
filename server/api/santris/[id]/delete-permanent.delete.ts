// server/api/santris/[id]/delete-permanent.delete.ts
import { serverSupabase } from '../../../utils/supabase'
import { getRouterParam, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase()
  const id = getRouterParam(event, 'id')

  // Validasi ID
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID santri wajib diisi.'
    })
  }

  try {
    // Cek apakah santri ada di database
    const { data: existingSantri, error: checkError } = await supabase
      .from('santris')
      .select('id, full_name, deleted_at')
      .eq('id', id)
      .single()

    if (checkError || !existingSantri) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Santri tidak ditemukan.'
      })
    }

    // Opsional: Pastikan hanya santri yang sudah soft-deleted boleh dihapus permanen
    if (!existingSantri.deleted_at) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Santri belum dihapus (soft delete). Hapus permanen hanya bisa dilakukan setelah soft delete.'
      })
    }

    // Lakukan penghapusan permanen
    const { error: deleteError } = await supabase
      .from('santris')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Gagal menghapus permanen santri: ${deleteError.message}`
      })
    }

    // Return hasil sukses
    return {
      success: true,
      message: `Santri "${existingSantri.full_name}" berhasil dihapus permanen.`,
      data: {
        id: existingSantri.id,
        full_name: existingSantri.full_name
      }
    }
  } catch (err: any) {
    console.error('❌ Error Delete Permanen Santri:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Terjadi kesalahan internal saat menghapus santri.'
    })
  }
})
