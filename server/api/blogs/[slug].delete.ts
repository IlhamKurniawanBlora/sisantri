// server/api/santris/[id].delete.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const id = getRouterParam(event, 'id')
    const query = getQuery(event)
    const forceDelete = query.force === 'true'

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID parameter is required'
      })
    }

    let data, error

    if (forceDelete) {
      // Hard delete (hapus permanen)
      const result = await supabase
        .from('santris')
        .delete()
        .eq('id', id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Soft delete (isi kolom deleted_at)
      const result = await supabase
        .from('santris')
        .update({
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    return {
      success: true,
      data,
      message: forceDelete
        ? 'Santri permanently deleted successfully'
        : 'Santri moved to trash successfully'
    }
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})
