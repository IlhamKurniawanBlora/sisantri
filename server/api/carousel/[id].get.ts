export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('carousel_images')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 404, statusMessage: error.message })
  return data
})
