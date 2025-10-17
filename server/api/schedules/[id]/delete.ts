import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const params = (event.context?.params ?? {}) as Record<string, string | undefined>
    const id = params.id

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID is required'
      })
    }

    const { error } = await supabase
      .from('schedules')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to delete schedule: ${error.message}`
      })
    }

    return { success: true, message: 'Schedule deleted successfully' }
  } catch (err: any) {
    console.error('Delete Schedule Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})