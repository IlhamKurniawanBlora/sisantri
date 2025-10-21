// server/api/profile/index.get.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const { data: { user }, error: authError } = await serverSupabase().auth.getUserByCookie(event.req, event.res)    
    if (authError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Please login first'
      })
    }

    const supabase = serverSupabase()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw createError({
        statusCode: 400,
        statusMessage: `Failed to fetch profile: ${profileError.message}`
      })
    }

    let santriData = null
    const profileEmail = profile?.email || user.email
    
    if (profileEmail) {
      const { data: santris, error: santriError } = await supabase
        .from('santris')
        .select('*')
        .is('deleted_at', null)
        .limit(1)

      if (santriError && santriError.code !== 'PGRST116') {
        console.warn('Santri data fetch warning:', santriError.message)
      } else if (santris && santris.length > 0) {
        santriData = santris[0]
      }
    }

    let finalProfile = profile
    if (!profile) {
      const newProfile = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        phone: user.user_metadata?.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select('*')
        .single()

      if (createError) {
        console.warn('Failed to create profile:', createError.message)
        // Return basic data from auth user
        finalProfile = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: user.user_metadata?.phone || null
        }
      } else {
        finalProfile = createdProfile
      }
    }

    return {
      success: true,
      data: {
        profile: finalProfile,
        santri: santriData,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at
        }
      }
    }
  } catch (error: any) {
    console.error('Profile API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})