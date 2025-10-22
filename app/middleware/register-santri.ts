export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, profile } = useAuth()

  if (!user.value) {
    if (process.client) {
      useToast()?.add?.({
        title: 'Login diperlukan',
        description: 'Anda harus login terlebih dahulu untuk mendaftar sebagai santri',
        color: 'info'
      })
    }
    return navigateTo('/login')
  }

  // Jika sudah ada santri_id, berarti sudah terdaftar sebagai santri
  if (profile.value?.santri_id) {
    if (process.client) {
      useToast()?.add?.({
        title: 'Sudah terdaftar',
        description: 'Anda sudah terdaftar sebagai santri. Tidak dapat mendaftar lagi.',
        color: 'warning'
      })
    }
    return navigateTo('/profile')
  }
})
