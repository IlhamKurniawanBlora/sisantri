/**
 * NIS (Nomor Induk Santri) Generator Utility
 * Generates unique NIS with format: YYYY.MM.XXXXX
 * Example: 2025.10.00001
 */

const NIS_PREFIX_LENGTH = 7 // YYYY.MM
const NIS_SEQUENCE_LENGTH = 5 // XXXXX

/**
 * Generate NIS dengan format YYYY.MM.XXXXX
 * @param sequenceNumber - Nomor urut santri di bulan tersebut
 * @param date - Tanggal untuk menentukan bulan dan tahun (default: sekarang)
 * @returns NIS dalam format YYYY.MM.XXXXX
 */
export function generateNIS(sequenceNumber: number, date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const sequence = String(sequenceNumber).padStart(NIS_SEQUENCE_LENGTH, '0')

  return `${year}.${month}.${sequence}`
}

/**
 * Extract sequence number dari NIS yang sudah ada
 * @param nis - NIS dalam format YYYY.MM.XXXXX
 * @returns Sequence number (integer)
 */
export function extractSequenceFromNIS(nis: string): number {
  const parts = nis.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid NIS format')
  }
  return parseInt(parts[2], 10)
}

/**
 * Extract bulan dan tahun dari NIS
 * @param nis - NIS dalam format YYYY.MM.XXXXX
 * @returns Object dengan properti year dan month
 */
export function extractDateFromNIS(nis: string): { year: number; month: number } {
  const parts = nis.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid NIS format')
  }

  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10)
  }
}

/**
 * Validate format NIS
 * @param nis - NIS yang akan divalidasi
 * @returns true jika format valid
 */
export function isValidNISFormat(nis: string): boolean {
  const nisRegex = /^\d{4}\.\d{2}\.\d{5}$/
  return nisRegex.test(nis)
}
