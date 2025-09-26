// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  
  if (user.value) {
    if (process.client) {
      useToast().add({
        title: 'Already Logged In',
        description: 'You are already logged in',
        color: 'info'
      })
    }
    return navigateTo('/')
  }
})
