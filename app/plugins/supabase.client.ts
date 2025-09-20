import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/utils/schema/database'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const supabaseUrl = config.public.supabaseUrl as string | undefined
	const supabaseKey = config.public.supabaseKey as string | undefined
	const supabase = createClient<Database>(supabaseUrl ?? '', supabaseKey ?? '')

	return {
		provide: {
			supabase,
		},
	}
})

