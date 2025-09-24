<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, logout } = useAuth()
const toast = useToast()

// menu navigasi
const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home',
    active: route.path === '/'
  },
  {
    label: 'Santri',
    to: '/santri',
    icon: 'i-lucide-users',
    active: route.path.startsWith('/santri')
  },
  {
    label: 'Blog',
    to: '/blogs',
    icon: 'i-lucide-newspaper',
    active: route.path.startsWith('/blogs')
  }
])

// handle logout
const handleLogout = async () => {
  await logout()
  toast.add({
    title: 'Success',
    description: 'Logged out successfully',
    color: 'success',
    icon: 'i-lucide-check'
  })
  navigateTo('/')
}
</script>

<template>
  <UHeader>
    <!-- Logo -->
    <template #title>
      <AppLogo class="h-6 w-auto" />
    </template>

    <!-- Navigation (desktop) -->
    <UNavigationMenu :items="items" />

    <!-- Right slot (user + logout + darkmode) -->
    <template #right>
      <div class="flex items-center gap-3">
        <!-- Jika user login, tampilkan email & tombol logout -->
        <div v-if="user" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-300">
            {{ user.email }}
          </span>
          <UButton
            icon="i-lucide-log-out"
            size="sm"
            color="error"
            variant="soft"
            @click="handleLogout"
          >
            Logout
          </UButton>
        </div>

        <!-- Jika belum login -->
        <div v-else>
          <UButton
            icon="i-lucide-log-in"
            size="sm"
            color="primary"
            variant="soft"
            to="/login"
          >
            Login
          </UButton>
        </div>

        <!-- dark/light mode toggle -->
        <UColorModeButton />
      </div>
    </template>

    <!-- Navigation (mobile) -->
    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>
  </UHeader>
</template>
