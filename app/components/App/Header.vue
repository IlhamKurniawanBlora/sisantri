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
    <!-- Logo/Title -->
    <template #title>
      <AppLogo class="h-6 w-auto" />
    </template>

    <!-- Desktop Navigation - akan otomatis hidden di mobile oleh default -->
    <UNavigationMenu :items="items" />

    <!-- Right section -->
    <template #right>
      <div class="flex items-center gap-2">
        <!-- User section -->
        <template v-if="user">
          <!-- Desktop user info -->
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">
              {{ user.email }}
            </span>
            <UButton
              icon="i-lucide-log-out"
              size="sm"
              color="red"
              variant="soft"
              @click="handleLogout"
            >
              Logout
            </UButton>
          </div>

          <!-- Mobile user - icon logout dengan ukuran lebih besar -->
          <UButton
            class="sm:hidden"
            icon="i-lucide-log-out"
            size="md"
            color="red"
            variant="soft"
            @click="handleLogout"
            aria-label="Logout"
          />
        </template>

        <!-- Login button -->
        <template v-else>
          <!-- Desktop login -->
          <UButton
            class="hidden sm:flex"
            icon="i-lucide-log-in"
            size="sm"
            color="primary"
            variant="soft"
            to="/login"
          >
            Login
          </UButton>

          <!-- Mobile login - icon dengan ukuran lebih besar -->
          <UButton
            class="sm:hidden"
            icon="i-lucide-log-in"
            size="md"
            color="primary"
            variant="soft"
            to="/login"
            aria-label="Login"
          />
        </template>

        <!-- Dark mode toggle dengan ukuran lebih besar di mobile -->
        <UColorModeButton class="sm:size-sm size-md" />
      </div>
    </template>

    <!-- Mobile Navigation Menu (dalam body slot) -->
    <template #body>
      <!-- Navigation items untuk mobile dropdown dengan ukuran lebih besar -->
      <div class="space-y-1 mb-6">
        <UButton
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          size="lg"
          :color="item.active ? 'primary' : 'neutral'"
          :variant="item.active ? 'solid' : 'ghost'"
          class="w-full justify-start text-base font-medium py-3"
          block
        >
          {{ item.label }}
        </UButton>
      </div>

      <!-- User info untuk mobile dropdown -->
      <div v-if="user" class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div class="space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 px-3">
            {{ user.email }}
          </div>
          <UButton
            icon="i-lucide-log-out"
            size="lg"
            color="red"
            variant="soft"
            @click="handleLogout"
            class="w-full justify-start text-base py-3"
            block
          >
            Logout
          </UButton>
        </div>
      </div>

      <!-- Login untuk mobile dropdown jika belum login -->
      <div v-else class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <UButton
          icon="i-lucide-log-in"
          size="lg"
          color="primary"
          variant="soft"
          to="/login"
          class="w-full justify-center text-base py-3"
          block
        >
          Login
        </UButton>
      </div>
    </template>
  </UHeader>
</template>