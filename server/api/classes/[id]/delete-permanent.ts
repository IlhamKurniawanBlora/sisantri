import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
    try {
        const supabase = serverSupabase()
        const params = (event.context?.params ?? {}) as Record<string, string | undefined>
        const id = params.id

        if (!id) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID is required'
            })
        }

        const { data: existingClass, error: checkError } = await supabase
            .from('classes')
            .select('id, name')
            .eq('id', id)
            .single()

        if (checkError || !existingClass) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Kelas tidak ditemukan'
            })
        }

        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Gagal menghapus permanen kelas: ${error.message}`
            })
        }

        return { 
            success: true, 
            message: 'Kelas berhasil dihapus permanen',
            data: {
                id: existingClass.id,
                name: existingClass.name
            }
        }
    } catch (err: any) {
        console.error('Permanent Delete Class Error:', err)
        throw createError({
            statusCode: err?.statusCode || 500,
            statusMessage: err?.statusMessage || err?.message || 'Internal server error'
        })
    }
})