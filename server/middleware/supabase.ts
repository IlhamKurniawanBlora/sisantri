import { createClient } from '@supabase/supabase-js'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseServiceKey = config.supabaseServiceKey as string

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Supabase URL or service key is missing in runtimeConfig')
    return
  }

  // Attach a server-side supabase client to event.context for server handlers
  // using the service role key which has elevated privileges (keep secret)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false }
  })

  // Attach as $supabase for consistency with existing code
  ;(event as any).context = (event as any).context || {}
  ;(event as any).context.$supabase = supabase
})
