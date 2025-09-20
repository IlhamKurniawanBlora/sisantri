interface DeletePayload {
  id: string
  permanent?: boolean
}

export default defineEventHandler(async (event) => {
  try {
    const { $supabase: supabase } = useNuxtApp() as any

    const body = await readBody(event) as DeletePayload

    if (!body.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Santri ID is required'
      })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()

    if (!profile || profile.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    let result

    if (body.permanent) {
      // Permanent delete
      const { error } = await supabase
        .from('santris')
        .delete()
        .eq('id', body.id)

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to delete santri permanently: ${error.message}`
        })
      }

      result = { message: 'Santri deleted permanently' }
    } else {
      // Soft delete using the utility function
      const { data, error } = await supabase.rpc('soft_delete_santri', {
        santri_id: body.id
      })

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to delete santri: ${error.message}`
        })
      }

      if (!data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Santri not found or already deleted'
        })
      }

      result = { message: 'Santri soft deleted successfully' }
    }

    return {
      success: true,
      ...result
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})