<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'id'
  },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
  ]
})

const { user, logout } = useAuth()
const toast = useToast()

const handleLogout = async () => {
  await logout()
  toast.add({
    title: 'Success',
    description: 'Logged out successfully',
    color: 'success'
  })
  navigateTo('/', { replace: true })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
    <!-- Header -->
    <AppHeader />

    <!-- Logout button (atas kanan) -->
    <div v-if="user" class="flex justify-end px-4 pt-2">
      <UButton
        icon="i-lucide-log-out"
        size="sm"
        color="error"
        @click="handleLogout"
      >
        Logout
      </UButton>
    </div>

    <!-- Main content -->
    <main class="container mx-auto flex-1 px-4 py-6">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />

    <!-- Logout button (bawah kanan, kalau memang mau) -->
    <!--
    <div v-if="user" class="flex justify-end px-4 pb-4">
      <UButton
        icon="i-lucide-log-out"
        size="sm"
        color="error"
        @click="handleLogout"
      >
        Logout
      </UButton>
    </div>
    -->
  </div>
</template>
