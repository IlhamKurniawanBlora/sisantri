import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async () => {
  const client = serverSupabase()

  try {
    const { count: total } = await client
      .from('santris')
      .select('*', { count: 'exact', head: true })

    const { count: active } = await client
      .from('santris')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)

    const { count: inactive } = await client
      .from('santris')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null)

    return {
      total: total || 0,
      active: active || 0,
      inactive: inactive || 0,
    }
  } catch (error: any) {
    console.error('Santris Stats Error:', error)
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Internal server error',
    })
  }
})
