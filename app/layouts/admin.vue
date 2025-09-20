<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <!-- Logo Section -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-academic-cap" class="w-8 h-8 text-primary-500" />
          <span class="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
        <UButton
          variant="ghost"
          size="sm"
          icon="i-heroicons-x-mark"
          class="lg:hidden"
          @click="sidebarOpen = false"
        />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-4 space-y-2">
        <div class="space-y-1">
          <!-- Dashboard -->
          <NuxtLink
            to="/admin"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin' ? 
              'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
          >
            <UIcon name="i-heroicons-home" class="w-5 h-5 mr-3" />
            Dashboard
          </NuxtLink>

          <!-- Santris -->
          <NuxtLink
            to="/admin/santris"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path.startsWith('/admin/santris') ? 
              'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
          >
            <UIcon name="i-heroicons-users" class="w-5 h-5 mr-3" />
            Santris
          </NuxtLink>

          <!-- Blogs -->
          <NuxtLink
            to="/admin/blogs"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path.startsWith('/admin/blogs') ? 
              'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 
              'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'"
          >
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 mr-3" />
            Blogs
          </NuxtLink>
        </div>

        <!-- Settings Section -->
        <div class="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
          <div class="space-y-1">
            <NuxtLink
              to="/admin/settings"
              class="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 mr-3" />
              Settings
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <UDropdown :items="userMenuItems" :popper="{ placement: 'top-start' }">
          <div class="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <UAvatar
              src="/api/placeholder/40/40"
              alt="Admin User"
              size="sm"
              class="mr-3"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                Admin User
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@example.com
              </p>
            </div>
            <UIcon name="i-heroicons-chevron-up" class="w-4 h-4 text-gray-400" />
          </div>
        </UDropdown>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="lg:ml-64">
      <!-- Top Navigation -->
      <header class="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <!-- Mobile menu button -->
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-bars-3"
            class="lg:hidden"
            @click="sidebarOpen = true"
          />

          <!-- Search -->
          <div class="flex-1 max-w-md mx-4">
            <UInput
              icon="i-heroicons-magnifying-glass"
              placeholder="Search..."
              class="w-full"
            />
          </div>

          <!-- Right side actions -->
          <div class="flex items-center space-x-3">
            <!-- Dark mode toggle -->
            <UButton
              variant="ghost"
              size="sm"
              :icon="isDark ? 'i-heroicons-sun' : 'i-heroicons-moon'"
              @click="toggleDarkMode"
            />
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const sidebarOpen = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

const toggleDarkMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const userMenuItems = [
  [{
    label: 'Profile',
    icon: 'i-heroicons-user',
    click: () => navigateTo('/admin/profile')
  }],
  [{
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    click: () => navigateTo('/admin/settings')
  }],
  [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-on-rectangle',
    click: () => {
      // Handle logout
      console.log('Logout clicked')
    }
  }]
]

// Close sidebar on route change (mobile)
watch(() => useRoute().path, () => {
  sidebarOpen.value = false
})
</script>