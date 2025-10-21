// composables/useAuth.ts
import { useState, useNuxtApp, computed, onMounted } from '#imports'
import type { SupabaseClient, AuthChangeEvent, Session, User } from '@supabase/supabase-js'

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const session = useState<Session | null>('session', () => null)
  const profile = useState<any | null>('profile', () => null)

  const { $supabase } = useNuxtApp()
  const supabase = $supabase as SupabaseClient

  /** 🔹 Persist user + session + profile ke localStorage */
  const persistUser = (userObj: any, sessionObj: any = null, profileObj: any = null) => {
    if (!process.client) return
    if (userObj) {
      localStorage.setItem('user', JSON.stringify(userObj))
      if (sessionObj) localStorage.setItem('session', JSON.stringify(sessionObj))
      if (profileObj) localStorage.setItem('profile', JSON.stringify(profileObj))
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('session')
      localStorage.removeItem('profile')
    }
  }

  /** 🔹 Ambil profil lengkap user dari tabel `profiles` */
  const fetchProfile = async () => {
    if (!user.value) return
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.warn('Profile fetch error:', error.message)
        return
      }

      if (data) {
        profile.value = data
        persistUser(user.value, session.value, data)
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  /** 🔹 Mendapatkan header Authorization untuk API eksternal */
  const getAuthHeaders = (): Record<string, string> => {
    const currentSession =
      session.value ||
      (process.client && localStorage.getItem('session')
        ? JSON.parse(localStorage.getItem('session')!)
        : null)

    return currentSession?.access_token
      ? { Authorization: `Bearer ${currentSession.access_token}` }
      : {}
  }

  /** 🔹 Inisialisasi sesi Supabase */
  const initSession = async () => {
    if (process.client) {
      const storedUser = localStorage.getItem('user')
      const storedSession = localStorage.getItem('session')
      const storedProfile = localStorage.getItem('profile')

      if (storedUser) user.value = JSON.parse(storedUser)
      if (storedSession) session.value = JSON.parse(storedSession)
      if (storedProfile) profile.value = JSON.parse(storedProfile)
    }

    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? user.value
    session.value = data.session ?? session.value
    persistUser(user.value, session.value, profile.value)

    if (user.value) await fetchProfile()

    // Hindari multiple subscription
    if (!process.client || (window as any)._supabaseAuthSubscribed) return

    supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, sessionData: Session | null) => {
      user.value = sessionData?.user ?? null
      session.value = sessionData ?? null
      if (user.value) {
        await fetchProfile()
      } else {
        profile.value = null
        persistUser(null)
      }
    })

    ;(window as any)._supabaseAuthSubscribed = true
  }

  /** 🔹 Register user baru */
  const register = async (email: string, password: string, name?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone },
      },
    })
    if (error) throw error

    user.value = data.user
    session.value = data.session
    await fetchProfile()
    persistUser(user.value, session.value, profile.value)
    return data
  }

  /** 🔹 Login user */
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    user.value = data.user
    session.value = data.session
    await fetchProfile()
    persistUser(user.value, session.value, profile.value)
    return data
  }

  /** 🔹 Logout user */
  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    session.value = null
    profile.value = null
    persistUser(null)
  }

  const isLoggedIn = computed(() => !!user.value)

  /** 🔹 Restore dari localStorage di sisi client */
  if (process.client) {
    onMounted(() => {
      if (!user.value) {
        const storedUser = localStorage.getItem('user')
        const storedSession = localStorage.getItem('session')
        const storedProfile = localStorage.getItem('profile')

        if (storedUser) user.value = JSON.parse(storedUser)
        if (storedSession) session.value = JSON.parse(storedSession)
        if (storedProfile) profile.value = JSON.parse(storedProfile)
      }
    })
  }

  return {
    user,
    session,
    profile,
    isLoggedIn,
    initSession,
    register,
    login,
    logout,
    getAuthHeaders,
    fetchProfile,
  }
}
