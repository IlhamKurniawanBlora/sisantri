import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabase()

  // Hitung total semua jadwal
  const { count: total } = await client
    .from('schedules')
    .select('*', { count: 'exact', head: true })

  // Hitung total aktif (belum dihapus)
  const { count: active } = await client
    .from('schedules')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Hitung total tidak aktif (sudah dihapus)
  const { count: inactive } = await client
    .from('schedules')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null)

  // Hitung jadwal yang sedang berlangsung (hari ini)
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

  const { count: today } = await client
    .from('schedules')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .gte('start_at', startOfDay.toISOString())
    .lt('start_at', endOfDay.toISOString())

  // Hitung jadwal yang akan datang (setelah hari ini)
  const { count: upcoming } = await client
    .from('schedules')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)
    .gte('start_at', endOfDay.toISOString())

  // Hitung jadwal yang memiliki kelas
  const { count: withClasses } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  return {
    total: total || 0,
    active: active || 0,
    inactive: inactive || 0,
    today: today || 0,
    upcoming: upcoming || 0,
    withClasses: withClasses || 0,
  }
})