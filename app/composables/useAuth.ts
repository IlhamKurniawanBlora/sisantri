// composables/useAuth.ts


import { useState, useNuxtApp, computed, onMounted } from '#imports'
import type { SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js'


export const useAuth = () => {
  // SSR-safe user state
  const user = useState<any | null>('user', () => null)
  const session = useState<any | null>('session', () => null)
  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient

  // Helper: persist user session to localStorage
  const persistUser = (userObj: any, sessionObj: any = null) => {
    if (process.client) {
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj))
        if (sessionObj) {
          localStorage.setItem('session', JSON.stringify(sessionObj))
        }
      } else {
        localStorage.removeItem('user')
        localStorage.removeItem('session')
      }
    }
  }

  // Get current session token for API calls
  const getAuthHeaders = (): Record<string, string> => {
    const currentSession = session.value || (process.client && localStorage.getItem('session') ? JSON.parse(localStorage.getItem('session')!) : null)
    if (currentSession?.access_token) {
      return {
        'Authorization': `Bearer ${currentSession.access_token}`
      }
    }
    return {}
  }

  // Initialize session and subscribe to auth state changes
  const initSession = async () => {
    // Try restore from localStorage (client only)
    if (process.client) {
      const storedUser = localStorage.getItem('user')
      const storedSession = localStorage.getItem('session')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch {}
      }
      if (storedSession) {
        try {
          session.value = JSON.parse(storedSession)
        } catch {}
      }
    }
    // Always check with supabase
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    session.value = data.session ?? null
    persistUser(user.value, session.value)
    if (!process.client) return
    if ((window as any)._supabaseAuthSubscribed) return
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, sessionData: Session | null) => {
      user.value = sessionData?.user ?? null
      session.value = sessionData ?? null
      persistUser(user.value, session.value)
    })
    ;(window as any)._supabaseAuthSubscribed = true
  }

  // Register new user
  const register = async (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    })
    if (error) throw error
    user.value = data.user
    session.value = data.session
    persistUser(user.value, session.value)
    return data
  }

  // Login user
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    user.value = data.user
    session.value = data.session
    persistUser(user.value, session.value)
    return data
  }

  // Logout user
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
    persistUser(null, null)
  }

  // Computed: is user logged in
  const isLoggedIn = computed(() => !!user.value)

  // On client, always try to restore session on composable use
  if (process.client) {
    onMounted(() => {
      if (!user.value) {
        const storedUser = localStorage.getItem('user')
        const storedSession = localStorage.getItem('session')
        if (storedUser) {
          try {
            user.value = JSON.parse(storedUser)
          } catch {}
        }
        if (storedSession) {
          try {
            session.value = JSON.parse(storedSession)
          } catch {}
        }
      }
    })
  }

  return {
    user,
    session,
    isLoggedIn,
    initSession,
    register,
    login,
    logout,
    getAuthHeaders
  }
}
