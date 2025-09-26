export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (!user.value) {
    if (process.client) {
      useToast().add({
        title: 'Access Denied',
        description: 'You must be logged in to access this page',
        color: 'error'
      })
    }
    return navigateTo('/')
  }
})
