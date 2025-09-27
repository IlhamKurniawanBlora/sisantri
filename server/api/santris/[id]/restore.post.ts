// server/api/santris/[id]/restore.post.ts
import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID santri wajib ada'
      })
    }

    const { error } = await supabase
      .from('santris')
      .update({ deleted_at: null })
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Gagal merestore santri: ${error.message}`
      })
    }

    return { success: true, message: 'Santri berhasil direstore' }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
