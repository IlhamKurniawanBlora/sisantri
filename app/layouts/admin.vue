<script setup lang="ts">
const { user, logout } = useAuth()
import type { SupabaseClient } from '@supabase/supabase-js'
const supabase = useNuxtApp().$supabase as SupabaseClient
const sidebarOpen = ref(false)
const toast = useToast()
const route = useRoute()

type UserProfile = {
  id: string
  name?: string
  avatar_url?: string
  [key: string]: any
}
const userProfile = ref<UserProfile | null>(null)

const fetchUserProfile = async () => {
  if (!user.value) {
    toast.add({ title: 'Error', description: 'User not logged in', color: 'error' })
    navigateTo('/')
    return
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.value.id)
    .single()
  if (!error) userProfile.value = data
}

onMounted(fetchUserProfile)
watch(user, (val) => { if (val) fetchUserProfile(); else userProfile.value = null })
watch(() => route.path, () => { sidebarOpen.value = false })


const showLogoutDialog = ref(false)

const handleLogout = async () => {
  showLogoutDialog.value = true
}

const confirmLogout = async (confirmed: boolean) => {
  showLogoutDialog.value = false
  if (confirmed) {
    await logout()
    toast.add({ title: 'Success', description: 'Logged out successfully', color: 'success' })
    navigateTo('/')
  }
}

const sidebarLinks = [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/admin', exact: true },
  { type: 'separator' },
  { label: 'Pendaftar', icon: 'i-lucide-user-plus', to: '/admin/registrants' },
  { label: 'Santri', icon: 'i-lucide-users', to: '/admin/santris' },
  { label: 'Kelas', icon: 'i-lucide-book', to: '/admin/classes' },
  { label: 'Jadwal', icon: 'i-lucide-calendar', to: '/admin/schedules' },
  { type: 'separator' },
  { label: 'Berita', icon: 'i-lucide-file-text', to: '/admin/blogs' },
  { type: 'separator' },
  { label: 'Pengaturan', icon: 'i-lucide-settings', to: '/admin/settings' }
]

const userMenuItems = [
  { label: 'Profile', icon: 'i-lucide-user', onSelect() {
        navigateTo(`/admin/profile`)
      } },
  { label: 'Logout', icon: 'i-lucide-log-out', onSelect: handleLogout }
]
</script>


<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <AppLogo />
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          class="lg:hidden"
          @click="sidebarOpen = false"
        />
      </div>

      <nav class="flex-1 px-4 py-4 space-y-2">
        <div class="space-y-1">
          <NuxtLink
            v-for="item in sidebarLinks"
            :key="item.to"
            :to="item.to"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="[route.path === item.to || (item.exact && route.path === item.to) ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800']"
          >
            <UIcon :name="item.icon" class="w-5 h-5 mr-3" />
            {{ item.label }}
          </NuxtLink>
        </div>
      </nav>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'top-start' }">
          <div class="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <UAvatar
              :src="userProfile?.avatar_url || ''"
              :alt="userProfile?.name || 'Admin User'"
              size="sm"
              class="mr-3"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                {{ userProfile?.full_name || 'Admin' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ user?.email || 'admin@example.com' }}
              </p>
            </div>
            <UIcon name="i-lucide-chevron-up" class="w-4 h-4 text-gray-400" />
          </div>
        </UDropdownMenu>
      </div>
    </aside>

    <div class="lg:ml-64">
      <AdminConfirmDialog
        v-if="showLogoutDialog"
        title="Konfirmasi Logout"
        description="Apakah Anda yakin ingin keluar dari akun?"
        confirmText="Logout"
        cancelText="Batal"
        variant="destructive"
        @close="confirmLogout"
      />
      <header class="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <UButton
            variant="ghost"
            size="sm"
            icon="i-lucide-menu"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />
          <div class="flex-1 max-w-md mx-4">
            
          </div>

          <div class="flex items-center space-x-3 mx-3">
            <UColorModeButton class="absolute z-10" />
          </div>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

