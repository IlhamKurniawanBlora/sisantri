import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const client = await serverSupabase()

  // Hitung total semua kelas
  const { count: total } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })

  // Hitung total aktif (belum dihapus)
  const { count: active } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Hitung total tidak aktif (sudah dihapus)
  const { count: inactive } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null)

  // Hitung kelas yang memiliki jadwal
  const { count: withSchedule } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  // Hitung kelas tanpa jadwal
  const { count: withoutSchedule } = await client
    .from('classes')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  return {
    total: total || 0,
    active: active || 0,
    inactive: inactive || 0,
    withSchedule: withSchedule || 0,
    withoutSchedule: withoutSchedule || 0,
  }
})