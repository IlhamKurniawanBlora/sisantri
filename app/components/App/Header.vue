<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const { user, profile, logout } = useAuth()
const toast = useToast()

// Navigation utama
const items = computed<NavigationMenuItem[]>(() => [
  { label: 'Beranda', to: '/', icon: 'i-lucide-home', active: route.path === '/' },
  { label: 'Santri', to: '/santri', icon: 'i-lucide-users', active: route.path.startsWith('/santri') },
  { label: 'Berita', to: '/blogs', icon: 'i-lucide-newspaper', active: route.path.startsWith('/blogs') },
  { label: 'Tentang', to: '/about', icon: 'i-lucide-info', active: route.path === '/about' },
])

const showLogoutDialog = ref(false)

// Dropdown user menu
const userMenuItems = computed(() => {
  const menu: any[] = []

  // Info email user
  menu.push([
    {
      label: user.value?.email || 'Tidak ada email',
      icon: 'i-lucide-mail',
      disabled: true,
      class: 'text-gray-600 dark:text-gray-300 cursor-default',
    },
  ])

  // Dashboard Admin jika role = admin
  if (profile.value?.role === 'admin') {
    menu.push([
      {
        label: 'Dashboard Admin',
        icon: 'i-lucide-gauge',
        to: '/admin',
      },
    ])
  }

  // Menu Profile
  menu.push([
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/profile',
    },
  ])

  // Menu Daftar Santri (jika belum punya santri_id)
  if (profile.value && !profile.value.student_id) {
    menu.push([
      {
        label: 'Daftar Santri',
        icon: 'i-lucide-user-plus',
        to: '/register-santri',
      },
    ])
  }

  // Logout
  menu.push([
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: () => {
        showLogoutDialog.value = true
      },
      class: 'text-red-600 dark:text-red-400',
    },
  ])

  return menu
})

// Handler dropdown menu selection
const handleMenuSelect = (item: any) => {
  // Jika item punya fungsi click, jalankan
  if (typeof item.click === 'function') {
    item.click()
  }
}

const confirmLogout = async (confirmed: boolean) => {
  showLogoutDialog.value = false
  if (!confirmed) return

  await logout()
  toast.add({
    title: 'Berhasil Logout',
    description: 'Anda telah keluar dari akun',
    color: 'success',
    icon: 'i-lucide-check',
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

    <!-- Menu utama -->
    <UNavigationMenu :items="items" />

    <!-- Bagian kanan -->
    <template #right>
      <div class="flex items-center gap-2">
        <!-- Jika login -->
        <template v-if="user">
          <!-- Desktop -->
          <div class="hidden sm:flex items-center gap-2">
            <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end' }" @select="handleMenuSelect">
              <UButton
                icon="i-lucide-user"
                size="sm"
                color="neutral"
                variant="ghost"
                class="max-w-48"
              >
                <span class="max-w-32 truncate">{{ user.email }}</span>
                <UIcon name="i-lucide-chevron-down" class="w-4 h-4 ml-1" />
              </UButton>
            </UDropdownMenu>
          </div>

          <!-- Mobile -->
          <div class="sm:hidden">
            <UDropdownMenu :items="userMenuItems" :popper="{ placement: 'bottom-end' }" @select="handleMenuSelect">
              <UButton
                icon="i-lucide-user"
                size="md"
                color="neutral"
                variant="ghost"
                aria-label="User menu"
              />
            </UDropdownMenu>
          </div>
        </template>

        <!-- Jika belum login -->
        <template v-else>
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

        <!-- Tombol mode gelap -->
        <UColorModeButton class="sm:size-sm size-md" />
      </div>
    </template>

    <!-- Body Drawer (mobile menu) -->
    <template #body>
      <!-- Navigasi utama -->
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

      <!-- Menu user -->
      <div v-if="user" class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <div class="space-y-4">
          <div class="text-sm text-gray-600 dark:text-gray-300 px-3">
            {{ user.email }}
          </div>

          <NuxtLink v-if="profile?.role === 'admin'" to="/admin" class="block">
            <UButton
              icon="i-lucide-gauge"
              size="lg"
              color="primary"
              variant="soft"
              class="w-full justify-start text-base py-3"
              block
            >
              Dashboard Admin
            </UButton>
          </NuxtLink>

          <NuxtLink to="/profile" class="block">
            <UButton
              icon="i-lucide-user"
              size="lg"
              color="neutral"
              variant="ghost"
              class="w-full justify-start text-base py-3"
              block
            >
              Profile
            </UButton>
          </NuxtLink>

          <NuxtLink v-if="profile && !profile.student_id" to="/register-santri" class="block">
            <UButton
              icon="i-lucide-user-plus"
              size="lg"
              color="neutral"
              variant="ghost"
              class="w-full justify-start text-base py-3"
              block
            >
              Daftar Santri
            </UButton>
          </NuxtLink>

          <UButton
            icon="i-lucide-log-out"
            size="lg"
            color="error"
            variant="soft"
            @click="showLogoutDialog = true"
            class="w-full justify-start text-base py-3 cursor-pointer"
            block
          >
            Logout
          </UButton>
        </div>
      </div>

      <!-- Jika belum login -->
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

    <!-- Dialog konfirmasi logout -->
    <AdminConfirmDialog
      v-if="showLogoutDialog"
      title="Konfirmasi Logout"
      description="Apakah Anda yakin ingin keluar dari akun?"
      confirmText="Logout"
      cancelText="Batal"
      variant="destructive"
      @close="confirmLogout"
    />
  </UHeader>
</template>