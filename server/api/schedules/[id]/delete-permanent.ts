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

        // Cek apakah jadwal masih digunakan oleh kelas
        const { data: classesUsing, error: checkClassesError } = await supabase
            .from('classes')
            .select('id, name')
            .is('deleted_at', null)

        if (checkClassesError) {
            throw createError({
                statusCode: 500,
                statusMessage: `Error checking classes: ${checkClassesError.message}`
            })
        }

        if (classesUsing && classesUsing.length > 0) {
            const classNames = classesUsing.map(c => c.name).join(', ')
            throw createError({
                statusCode: 400,
                statusMessage: `Jadwal tidak dapat dihapus permanen karena masih digunakan oleh kelas: ${classNames}`
            })
        }

        const { data: existingSchedule, error: checkError } = await supabase
            .from('schedules')
            .select('id, name')
            .eq('id', id)
            .single()

        if (checkError || !existingSchedule) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Jadwal tidak ditemukan'
            })
        }

        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', id)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Gagal menghapus permanen jadwal: ${error.message}`
            })
        }

        return { 
            success: true, 
            message: 'Jadwal berhasil dihapus permanen',
            data: {
                id: existingSchedule.id,
                name: existingSchedule.name
            }
        }
    } catch (err: any) {
        console.error('Permanent Delete Schedule Error:', err)
        throw createError({
            statusCode: err?.statusCode || 500,
            statusMessage: err?.statusMessage || err?.message || 'Internal server error'
        })
    }
})