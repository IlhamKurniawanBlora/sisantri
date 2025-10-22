// server/api/profile/index.put.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    // Get authorization token from header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7)
    const supabase = serverSupabase()

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }

    // Parse request body
    const body = await readBody(event)
    const { full_name, phone, avatar_url } = body

    if (!full_name || full_name.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Full name is required'
      })
    }

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: full_name.trim(),
        phone: phone ? phone.trim() : null,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to update profile: ${updateError.message}`
      })
    }

    return {
      success: true,
      data: {
        profile
      }
    }
  } catch (error: any) {
    console.error('Profile Update API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})
