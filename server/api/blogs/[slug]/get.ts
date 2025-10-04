import { serverSupabase } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase()
  const slug = event.context.params?.slug

  const { data, error } = await supabase
    .from('blogs')
    .select(`*`)
    .eq('slug', slug)
    .limit(1)
    .maybeSingle()

  return { data, error }
})

