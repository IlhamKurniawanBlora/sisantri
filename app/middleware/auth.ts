// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  
  if (user.value) {
    if (process.client) {
      useToast().add({
        title: 'Kamu sudah login',
        description: 'Anda sudah login dan tidak dapat mengakses halaman ini',
        color: 'info'
      })
    }
    return navigateTo('/')
  }
})
