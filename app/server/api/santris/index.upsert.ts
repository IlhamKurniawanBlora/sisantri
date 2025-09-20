interface SantriPayload {
  id?: string
  nis: string
  full_name: string
  address?: string
  gender?: 'male' | 'female'
  image_url?: string
}

export default defineEventHandler(async (event) => {
  try {
    const { $supabase: supabase } = useNuxtApp() as any

    const body = await readBody(event) as SantriPayload

    // Validate required fields
    if (!body.nis || !body.full_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'NIS and full_name are required'
      })
    }

    // Check if user is admin
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

    if (body.id) {
      // Update existing santri
      const { data, error } = await supabase
        .from('santris')
        .update({
          nis: body.nis,
          full_name: body.full_name,
          address: body.address,
          gender: body.gender,
          image_url: body.image_url
        })
        .eq('id', body.id)
        .select()
        .single()

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to update santri: ${error.message}`
        })
      }

      result = { data, message: 'Santri updated successfully' }
    } else {
      // Create new santri
      const { data, error } = await supabase
        .from('santris')
        .insert({
          nis: body.nis,
          full_name: body.full_name,
          address: body.address,
          gender: body.gender,
          image_url: body.image_url
        })
        .select()
        .single()

      if (error) {
        throw createError({
          statusCode: 400,
          statusMessage: `Failed to create santri: ${error.message}`
        })
      }

      result = { data, message: 'Santri created successfully' }
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