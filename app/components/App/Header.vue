<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, logout } = useAuth()
const toast = useToast()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Home', to: '/', icon: 'i-lucide-home', active: route.path === '/' },
  { label: 'Santri', to: '/santri', icon: 'i-lucide-users', active: route.path.startsWith('/santri') },
  { label: 'Blog', to: '/blogs', icon: 'i-lucide-newspaper', active: route.path.startsWith('/blogs') },
  { label: 'About', to: '/about', icon: 'i-lucide-info', active: route.path === '/about' }
])

const showLogoutDialog = ref(false)

const handleLogout = () => {
  showLogoutDialog.value = true
}

const confirmLogout = async (confirmed: boolean) => {
  showLogoutDialog.value = false
  if (confirmed) {
    await logout()
    toast.add({ title: 'Success', description: 'Logged out successfully', color: 'success', icon: 'i-lucide-check' })
    navigateTo('/')
  }
}
</script>

<template>
  <UHeader>
    <template #title><AppLogo class="h-6 w-auto" /></template>
    <UNavigationMenu :items="items" />
    <template #right>
      <div class="flex items-center gap-2">
        <template v-if="user">
          <div class="hidden sm:flex items-center gap-2">
            <span class="text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate">{{ user.email }}</span>
            <UButton icon="i-lucide-log-out" size="sm" color="error" variant="soft" @click="handleLogout">Logout</UButton>
          </div>
          <UButton class="sm:hidden" icon="i-lucide-log-out" size="md" color="error" variant="soft" @click="handleLogout" aria-label="Logout" />
        </template>
        <template v-else>
          <UButton class="hidden sm:flex" icon="i-lucide-log-in" size="sm" color="primary" variant="soft" to="/login">Login</UButton>
          <UButton class="sm:hidden" icon="i-lucide-log-in" size="md" color="primary" variant="soft" to="/login" aria-label="Login" />
        </template>
        <UColorModeButton class="sm:size-sm size-md" />
      </div>
    </template>
    <template #body>
      <div class="space-y-1 mb-6">
        <UButton v-for="item in items" :key="item.to" :to="item.to" :icon="item.icon" size="lg" :color="item.active ? 'primary' : 'neutral'" :variant="item.active ? 'solid' : 'ghost'" class="w-full justify-start text-base font-medium py-3" block>{{ item.label }}</UButton>
      </div>
      <div v-if="user" class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div class="space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 px-3">{{ user.email }}</div>
          <UButton icon="i-lucide-log-out" size="lg" color="error" variant="soft" @click="handleLogout" class="w-full justify-start text-base py-3 cursor-pointer" block>Logout</UButton>
        </div>
      </div>
      <div v-else class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <UButton icon="i-lucide-log-in" size="lg" color="primary" variant="soft" to="/login" class="w-full justify-center text-base py-3" block>Login</UButton>
      </div>
    </template>
    <AdminConfirmDialog v-if="showLogoutDialog" title="Konfirmasi Logout" description="Apakah Anda yakin ingin keluar dari akun?" confirmText="Logout" cancelText="Batal" variant="destructive" @close="confirmLogout" />
  </UHeader>
</template>
