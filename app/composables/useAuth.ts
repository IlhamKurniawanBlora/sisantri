export const useAuth = () => {
  const supabase = useNuxtApp().$supabase
  const user = useState('user', () => null)

  // Cek session saat pertama kali load
  const initSession = async () => {
    const { data } = await supabase.auth.getSession()
    user.value = data.session?.user ?? null

    // listener perubahan session (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  const register = async (email: string, password: string, name?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
        data: { name, phone }
        }
    })
    if (error) throw error
    user.value = data.user
    return data
    }

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
    return data
  }

  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
  }

  return {
    user,
    initSession,
    register,
    login,
    logout,
  }
}
