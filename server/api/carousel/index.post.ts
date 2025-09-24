export default defineEventHandler(async (event) => {
  const supabase = serverSupabase()
  const form = await readMultipartFormData(event)
  const file = form?.find((f) => f.name === 'file')
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' })
  }
  const id = crypto.randomUUID()
  const fileName = `${Date.now()}-${file.filename}`
  const filePath = `${id}/${fileName}`
  const { error: uploadError } = await supabase.storage
    .from('carousel-images')
    .upload(filePath, file.data, {
      contentType: file.type,
      upsert: true
    })
  if (uploadError) {
    throw createError({ statusCode: 500, statusMessage: uploadError.message })
  }
  // get public url helper
  const getPublicUrl = (path: string) => supabase.storage.from('carousel-images').getPublicUrl(path).data.publicUrl
  const publicUrl = getPublicUrl(filePath)
  const { data, error } = await supabase
    .from('carousel_images')
    .insert({
      id,
      image_url: publicUrl
    })
    .select()
    .single()
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }
  return data
})
