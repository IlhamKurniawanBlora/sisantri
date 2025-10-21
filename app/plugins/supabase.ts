import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = process.server
    ? config.supabaseServiceKey
    : config.public.supabaseKey

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase URL atau Key belum diset di runtimeConfig')
    return
  }

  // Buat Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true, // biar session tersimpan di localStorage
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  // Tambahkan ke NuxtApp agar bisa diakses lewat useNuxtApp()
  nuxtApp.provide('supabase', supabase)
  nuxtApp.provide('$supabase', supabase)

  // Optional: Tambahkan global akses langsung via window (dev mode)
  if (process.client) {
    // @ts-ignore
    window.supabase = supabase
  }

  console.log('✅ Supabase client berhasil diinisialisasi')
})
