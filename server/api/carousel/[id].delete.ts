export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabase()

  // cari image_url
  const { data: row, error: findError } = await supabase
    .from('carousel_images')
    .select('image_url')
    .eq('id', id)
    .single()

  if (findError) {
    throw createError({ statusCode: 404, statusMessage: findError.message })
  }

  const filePath = row.image_url.split('/carousel_images/')[1]

  // hapus file di storage
  if (filePath) {
    await supabase.storage.from('carousel_images').remove([filePath])
  }

  // soft delete di DB
  const { data, error } = await supabase
    .from('carousel_images')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { message: 'Carousel deleted', data }
})
