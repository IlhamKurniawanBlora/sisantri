// server/api/registrants/[id]/index.get.ts
import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Registrant ID is required'
      })
    }

    const supabase = await serverSupabase()

    const { data, error } = await supabase
      .from('santris')
      .select('*')
      .eq('id', id)
      .is('accepted_at', null) // Hanya ambil yang belum diterima
      .single()

    if (error || !data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Registrant not found'
      })
    }

    return {
      success: true,
      data
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
