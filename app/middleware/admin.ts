// middleware/admin.ts
import { useNuxtApp } from '#imports'
export default defineNuxtRouteMiddleware(async () => {
  const { user } = useAuth()
  const { $supabase } = useNuxtApp()
  if (!user.value) {
    if (process.client) {
      useToast().add({
        title: 'Access Denied',
        description: 'You must be logged in to access admin panel',
        color: 'error'
      })
    }
    return navigateTo('/')
  }
  try {
    const { data: profile, error } = await $supabase
      .from('profiles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    if (error) {
      if (process.client) {
        useToast().add({
          title: 'Error',
          description: 'Failed to verify user permissions',
          color: 'error'
        })
      }
      return navigateTo('/')
    }
    if (!profile || profile.role !== 'admin') {
      if (process.client) {
        useToast().add({
          title: 'Access Denied',
          description: 'You do not have permission to access admin panel',
          color: 'error'
        })
      }
      return navigateTo('/')
    }
  } catch (error) {
    if (process.client) {
      useToast().add({
        title: 'Error',
        description: 'Something went wrong while verifying permissions',
        color: 'error'
      })
    }
    return navigateTo('/')
  }
})