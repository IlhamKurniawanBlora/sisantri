/**
 * Santris Service
 * Handles database operations related to santri/registrant
 */

import { serverSupabase } from './supabase'
import { generateNIS, extractDateFromNIS } from './nisGenerator'

/**
 * Get next sequence number untuk NIS bulan ini
 * @returns Nomor urut berikutnya
 */
export async function getNextNISSequenceNumber(): Promise<number> {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const currentMonthPrefix = `${year}.${month}.`

  const supabase = await serverSupabase()

  // Query semua NIS dengan prefix bulan ini
  const { data: existingSantris, error } = await supabase
    .from('santris')
    .select('nis')
    .ilike('nis', `${currentMonthPrefix}%`)
    .order('nis', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching last NIS:', error)
    return 1
  }

  // Jika tidak ada santri bulan ini, mulai dari 1
  if (!existingSantris || existingSantris.length === 0) {
    return 1
  }

  // Extract sequence dari NIS terakhir dan tambah 1
  const lastNIS = existingSantris[0].nis
  const lastSequence = parseInt(lastNIS.split('.')[2], 10)

  return lastSequence + 1
}

/**
 * Generate unique NIS untuk registrant baru
 * @returns NIS yang sudah di-generate
 */
export async function generateAutoNIS(): Promise<string> {
  const nextSequence = await getNextNISSequenceNumber()
  const generatedNIS = generateNIS(nextSequence)
  return generatedNIS
}

/**
 * Check apakah NIS sudah terdaftar
 * @param nis - NIS yang akan dicek
 * @returns true jika NIS sudah ada
 */
export async function checkNISExists(nis: string): Promise<boolean> {
  const supabase = await serverSupabase()

  const { data, error } = await supabase
    .from('santris')
    .select('nis', { count: 'exact', head: true })
    .eq('nis', nis)

  if (error) {
    console.error('Error checking NIS:', error)
    return false
  }

  return data && data.length > 0
}
