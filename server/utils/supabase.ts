// server/utils/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'

export const serverSupabase = (): SupabaseClient => {
    const config = useRuntimeConfig()

    const url =
        // private nested config (nuxt runtimeConfig.supabase.url)
        (config as any).supabase?.url ||
        // flat private key (runtimeConfig.supabaseUrl)
        (config as any).supabaseUrl ||
        // public config (runtimeConfig.public.supabaseUrl)
        (config as any).public?.supabaseUrl ||
        // fallback to env
        process.env.SUPABASE_URL

    const serviceKey =
        // private nested config (runtimeConfig.supabase.serviceKey)
        (config as any).supabase?.serviceKey ||
        // flat private key (runtimeConfig.supabaseServiceKey)
        (config as any).supabaseServiceKey ||
        // fallback to env
        process.env.SUPABASE_SERVICE_KEY

    if (!url || !serviceKey) {
        throw new Error('Supabase URL or Service Key is not configured.')
    }

    return createClient(url, serviceKey)
}
