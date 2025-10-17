// server/api/registrants/[id]/accept.patch.ts
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
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('santris')
      .update({
        accepted_at: now,
        updated_at: now
      })
      .eq('id', id)
      .is('accepted_at', null) // Hanya update yang belum diterima
      .select('*')
      .single()

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Registrant not found or already accepted'
      })
    }

    return {
      success: true,
      data,
      message: 'Registrant accepted successfully'
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
