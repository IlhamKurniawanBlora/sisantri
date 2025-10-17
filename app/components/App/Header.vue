<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, logout, getAuthHeaders } = useAuth()
const toast = useToast()

const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Beranda', to: '/', icon: 'i-lucide-home', active: route.path === '/' },
  { label: 'Santri', to: '/santri', icon: 'i-lucide-users', active: route.path.startsWith('/santri') },
  { label: 'Berita', to: '/blogs', icon: 'i-lucide-newspaper', active: route.path.startsWith('/blogs') },
  { label: 'Tentang', to: '/about', icon: 'i-lucide-info', active: route.path === '/about' }
])

const showLogoutDialog = ref(false)
const profile = ref<any>(null)
const loading = ref(false)

// Fetch user profile data
const fetchProfile = async () => {
  if (!user.value || loading.value) return
  
  try {
    loading.value = true
    const { data } = await $fetch('/api/profile', {
      headers: getAuthHeaders()
    })
    profile.value = data
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    loading.value = false
  }
}

// Watch for user changes and fetch profile
watch(user, (newUser) => {
  if (newUser) {
    fetchProfile()
  } else {
    profile.value = null
  }
}, { immediate: true })

// User dropdown menu items
const userMenuItems = computed(() => {
  const items: any[] = [
    [{
      label: user.value?.email || 'Email',
      icon: 'i-lucide-mail',
      disabled: true,
      class: 'text-gray-600 dark:text-gray-300 cursor-default'
    }],
    [{
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile'
    }]
  ]

  // If profile doesn't have student_id (santri data), show register santri option
  if (profile.value && !profile.value.santri) {
    items.push([{
      label: 'Daftar Santri',
      icon: 'i-lucide-user-plus',
      to: '/register-santri'
    }])
  }

  // Add logout option
  items.push([{
    label: 'Logout',
    icon: 'i-lucide-log-out',
    click: handleLogout,
    class: 'text-red-600 dark:text-red-400'
  }])

  return items
})

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
            <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
              <UButton 
                icon="i-lucide-user" 
                size="sm" 
                color="neutral" 
                variant="ghost"
                :loading="loading"
                class="max-w-48"
              >
                <span class="max-w-32 truncate">{{ user.email }}</span>
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4 ml-1" />
              </UButton>
            </UDropdown>
          </div>
          <div class="sm:hidden">
            <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
              <UButton 
                icon="i-lucide-user" 
                size="md" 
                color="neutral" 
                variant="ghost"
                :loading="loading"
                aria-label="User menu"
              />
            </UDropdown>
          </div>
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
        <UButton 
          v-for="item in items" 
          :key="String(item.to)" 
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
      <div v-if="user" class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div class="space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 px-3">{{ user.email }}</div>
          <NuxtLink to="/profile" class="block">
            <UButton icon="i-lucide-user" size="lg" color="neutral" variant="ghost" class="w-full justify-start text-base py-3" block>Profile</UButton>
          </NuxtLink>
          <NuxtLink v-if="profile && !profile.santri" to="/register-santri" class="block">
            <UButton icon="i-lucide-user-plus" size="lg" color="neutral" variant="ghost" class="w-full justify-start text-base py-3" block>Daftar Santri</UButton>
          </NuxtLink>
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
