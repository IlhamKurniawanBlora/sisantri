// server/api/santris/[id]/delete-permanent.delete.ts
import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
    try {
        const supabase = serverSupabase()
        const params = (event.context?.params ?? {}) as Record<string, string | undefined>
        const id = params.id

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID santri wajib ada'
            })
        }

        // First check if the santri exists
        const { data: existingSantri, error: checkError } = await supabase
            .from('santris')
            .select('id, full_name')
            .eq('id', id)
            .single()

        if (checkError || !existingSantri) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Santri tidak ditemukan'
            })
        }

        // Permanently delete the santri
        const { error } = await supabase
            .from('santris')
            .delete()
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Gagal menghapus permanen santri: ${error.message}`
            })
        }

        return { 
            success: true, 
            message: 'Santri berhasil dihapus permanen',
            data: {
                id: existingSantri.id,
                name: existingSantri.full_name
            }
        }
    } catch (err: any) {
        console.error('Permanent Delete Santri Error:', err)
        throw createError({
            statusCode: err?.statusCode || 500,
            statusMessage: err?.statusMessage || err?.message || 'Internal server error'
        })
    }
})
