export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' })
  }

  const supabase = serverSupabase()
  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }

  const fileName = `${Date.now()}-${file.filename}`
  const filePath = `${id}/${fileName}`

  // Upload ke bucket supabase
  const { error: uploadError } = await supabase.storage
    .from('carousel-images') // ✅ perbaikan nama bucket
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: uploadError.message })
  }

  // Ambil public url
  const { data: publicUrlData } = supabase.storage
    .from('carousel-images')
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData.publicUrl

  // Update DB
  const { data, error } = await supabase
    .from('carousel_images')
    .update({
      image_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
