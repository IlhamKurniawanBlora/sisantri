<template>
  <footer class="bg-white border-t dark:bg-gray-950 dark:border-gray-800">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand -->
        <div class="space-y-4">
          <AppLogo />
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
              <UIcon name="i-lucide-map-pin" class="w-5 h-5 flex-shrink-0" />
              <span>
                Malangan UH VII/512 A, RT 039 RW 013 Kel. Giwangan, Kec. Umbulharjo,
                Kota Yogyakarta. 55163
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-phone" class="w-5 h-5 flex-shrink-0" />
              <span>+62 856-4063-3195</span>
            </div>
            <div class="flex items-center space-x-2">
              <UIcon name="i-lucide-mail" class="w-5 h-5 flex-shrink-0" />
              <span>info@SiDawam.id</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            © {{ new Date().getFullYear() }} SiDawam. All rights reserved.
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
  { name: 'Santri', href: '/santri' },
  { name: 'Berita', href: '/blogs' },
  { name: 'Tentang', href: '/about' }
]
</script>