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

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        classes (
          id,
          name,
          image_url
        )
      `)
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to get schedule: ${error.message}`
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Schedule not found'
      })
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('Get Schedule Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage:
        err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})