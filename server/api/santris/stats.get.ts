import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async () => {
  const client = serverSupabase()

  try {
    const { count: total } = await client
      .from('santris')
      .select('*', { count: 'exact', head: true })

    const { count: male } = await client
      .from('santris')
      .select('*', { count: 'exact', head: true })
      .eq('gender', 'male')

    return {
      total: total || 0,
      male: male || 0,
      female: (total || 0) - (male || 0),
    }
  } catch (error: any) {
    console.error('Santris Stats Error:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Internal server error',
    })
  }
})
