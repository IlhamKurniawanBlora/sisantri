// server/api/blogs/[slug].delete-permanent.ts
import { serverSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
    try {
        const supabase = serverSupabase()
        const params = (event.context?.params ?? {}) as Record<string, string | undefined>
        const slug = params.slug

        if (!slug) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Slug is required'
            })
        }

        // First check if the blog exists
        const { data: existingBlog, error: checkError } = await supabase
            .from('blogs')
            .select('id, slug, title')
            .eq('slug', slug)
            .single()

        if (checkError || !existingBlog) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Blog tidak ditemukan'
            })
        }

        // Permanent delete: remove row from table
        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('slug', slug)

        if (error) {
            throw createError({
                statusCode: 400,
                statusMessage: `Gagal menghapus permanen blog: ${error.message}`
            })
        }

        return { 
            success: true, 
            message: 'Blog berhasil dihapus permanen',
            data: {
                id: existingBlog.id,
                slug: existingBlog.slug,
                title: existingBlog.title
            }
        }
    } catch (err: any) {
        console.error('Permanent Delete Blog Error:', err)
        throw createError({
            statusCode: err?.statusCode || 500,
            statusMessage: err?.statusMessage || err?.message || 'Internal server error'
        })
    }
})
