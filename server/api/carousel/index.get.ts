
export default defineEventHandler(async (event) => {
  const supabase = serverSupabase()
  const { data, error } = await supabase
    .from('carousel_images')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  // always return array, never null
  return Array.isArray(data) ? data : []
})
