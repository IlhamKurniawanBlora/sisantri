import { serverSupabase } from '../../utils/supabase'

// // server/api/blogs/[slug].get.ts
// import { serverSupabase } from '../../utils/supabase'

// export default defineEventHandler(async (event) => {
//   try {
//     const supabase = serverSupabase()
//     const slug = getRouterParam(event, 'slug')

//     if (!slug) {
//       throw createError({
//         statusCode: 400,
//         statusMessage: 'Slug parameter is required'
//       })
//     }

//     const { data, error } = await supabase
//       .from('blogs')
//       .select(`
//         id,
//         slug,
//         title,
//         description,
//         content,
//         category,
//         tags,
//         author_id,
//         created_at,
//         updated_at,
//         deleted_at,
//         views,
//         profiles:author_id (
//           id,
//           full_name,
//           avatar_url
//         )
//       `)
//       .eq('slug', slug)
//       .is('deleted_at', null)
//       .single()

//     if (error || !data) {
//       throw createError({
//         statusCode: 404,
//         statusMessage: 'Blog not found'
//       })
//     }

//     // increment views
//     await supabase
//       .from('blogs')
//       .update({ views: (data.views ?? 0) + 1 })
//       .eq('id', data.id)

//     return {
//       success: true,
//       data
//     }
//   } catch (err: any) {
//     throw createError({
//       statusCode: err?.statusCode || 500,
//       statusMessage: err?.statusMessage || err?.message || 'Internal server error'
//     })
//   }
// })
//

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabase()
    const params = (event.context?.params ?? {}) as Record<string, string | undefined>
    const slug = params.slug

    if (!slug) {
      throw createError({ statusCode: 400, statusMessage: 'Slug parameter is required' })
    }

    const { data, error } = await supabase
      .schema('public')
      .from('blogs')
      .select(`
        id,
        slug,
        title,
        description,
        content,
        category,
        tags,
        image_url,
        author_id,
        created_at,
        updated_at,
        deleted_at,
        views,
        profiles:author_id (
          id,
          full_name,
          avatar_url,
          bio
        )
      `)
      .eq('slug', slug)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw createError({ statusCode: 404, statusMessage: 'Blog not found' })
    }

    // increment views (best-effort, ignore errors)
    await supabase
      .from('blogs')
      .update({ views: (data.views ?? 0) + 1 })
      .eq('id', data.id)

    return {
      success: true,
      data
    }
  } catch (err: any) {
    console.error('Get Blog Error:', err)
    throw createError({
      statusCode: err?.statusCode || 500,
      statusMessage: err?.statusMessage || err?.message || 'Internal server error'
    })
  }
})