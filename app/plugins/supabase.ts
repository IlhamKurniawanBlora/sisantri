import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string

  const supabaseKey = process.server
    ? (config.supabaseServiceKey as string)
    : (config.public.supabaseKey as string)

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL atau Key belum diset di runtimeConfig')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // Provide both `supabase` and `$supabase` so code using either convention works
  nuxtApp.provide('supabase', supabase)
  nuxtApp.provide('$supabase', supabase)
})
