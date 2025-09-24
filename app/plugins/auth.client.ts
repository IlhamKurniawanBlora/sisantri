import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { initSession } = useAuth()
  initSession()
})
