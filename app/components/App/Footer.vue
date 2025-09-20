<template>
  <footer class="bg-white border-t dark:bg-gray-950 dark:border-gray-800">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <UIcon name="i-heroicons-academic-cap" class="h-6 w-6 text-primary-600" />
            <span class="text-lg font-bold text-gray-900 dark:text-white">Sisantri</span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Sistem informasi digital untuk pengelolaan data santri dan berita pondok pesantren.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Menu Utama
          </h3>
          <ul class="space-y-2">
            <li v-for="item in footerLinks" :key="item.name">
              <NuxtLink
                :to="item.href"
                class="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
              >
                {{ item.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            Kontak
          </h3>
          <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
              <span>Jl. Pondok Pesantren No. 123, Yogyakarta</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-phone" class="h-4 w-4" />
              <span>(0274) 123-456</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-envelope" class="h-4 w-4" />
              <span>info@sisantri.id</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ new Date().getFullYear() }} Sisantri. All rights reserved.
          </p>
          <div class="flex items-center space-x-4 mt-4 md:mt-0">
            <span class="text-xs text-gray-500 dark:text-gray-500">Built with</span>
            <UIcon name="i-simple-icons-nuxtdotjs" class="h-4 w-4 text-green-500" />
            <UIcon name="i-simple-icons-supabase" class="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const footerLinks = [
  { name: 'Beranda', href: '/' },
  { name: 'Data Santri', href: '/santri' },
  { name: 'Blog', href: '/blogs' },
  { name: 'Tentang', href: '/about' }
]
</script>