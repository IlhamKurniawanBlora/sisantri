// composables/useAuth.ts


import { useState, useNuxtApp, computed, onMounted } from '#imports'
import type { SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js'


export const useAuth = () => {
  // SSR-safe user state
  const user = useState<any | null>('user', () => null)
  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient

  // Helper: persist user session to localStorage
  const persistUser = (userObj: any) => {
    if (process.client) {
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj))
      } else {
        localStorage.removeItem('user')
      }
    }
  }

  // Initialize session and subscribe to auth state changes
  const initSession = async () => {
    // Try restore from localStorage (client only)
    if (process.client) {
      const stored = localStorage.getItem('user')
      if (stored) {
        try {
          user.value = JSON.parse(stored)
        } catch {}
      }
    }
    // Always check with supabase
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null
    persistUser(user.value)
    if (!process.client) return
    if ((window as any)._supabaseAuthSubscribed) return
    supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      user.value = session?.user ?? null
      persistUser(user.value)
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
    persistUser(user.value)
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
    persistUser(user.value)
    return data
  }

  // Logout user
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    persistUser(null)
  }

  // Computed: is user logged in
  const isLoggedIn = computed(() => !!user.value)

  // On client, always try to restore session on composable use
  if (process.client) {
    onMounted(() => {
      if (!user.value) {
        const stored = localStorage.getItem('user')
        if (stored) {
          try {
            user.value = JSON.parse(stored)
          } catch {}
        }
      }
    })
  }

  return {
    user,
    isLoggedIn,
    initSession,
    register,
    login,
    logout
  }
}
