<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-20">
      <div class="max-w-4xl mx-auto">
        <UIcon name="i-heroicons-academic-cap" class="h-20 w-20 text-primary-600 mx-auto mb-8" />
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Selamat Datang di <span class="text-primary-600">Sisantri</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Sistem informasi digital untuk pengelolaan data santri dan penyebaran berita pondok pesantren
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton size="lg" to="/santri" class="text-white">
            <UIcon name="i-heroicons-users" class="mr-2" />
            Lihat Data Santri
          </UButton>
          <UButton size="lg" variant="outline" to="/blog">
            <UIcon name="i-heroicons-newspaper" class="mr-2" />
            Baca Berita
          </UButton>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fitur Utama
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Aplikasi yang dirancang khusus untuk memudahkan pengelolaan pondok pesantren
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UCard v-for="feature in features" :key="feature.title" class="text-center">
            <template #header>
              <div class="flex justify-center">
                <div class="p-3 bg-primary-50 dark:bg-primary-950 rounded-full">
                  <UIcon :name="feature.icon" class="h-8 w-8 text-primary-600" />
                </div>
              </div>
            </template>

            <div class="space-y-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ feature.title }}
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                {{ feature.description }}
              </p>
            </div>
          </UCard>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-primary-50 dark:bg-primary-950 rounded-3xl">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-12">
          Dalam Angka
        </h2>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label">
            <div class="text-4xl font-bold text-primary-600 mb-2">
              {{ stat.value }}
            </div>
            <div class="text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Mulai Jelajahi Sisantri
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Temukan informasi santri dan berita terbaru dari pondok pesantren
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton size="lg" to="/santri" class="text-white">
            Cari Santri
          </UButton>
          <UButton size="lg" variant="outline" to="/about">
            Pelajari Lebih Lanjut
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// SEO
useHead({
  title: 'Beranda - Sisantri',
  meta: [
    {
      name: 'description',
      content: 'Sistem informasi digital untuk pengelolaan data santri dan penyebaran berita pondok pesantren. Temukan informasi santri dan baca berita terbaru.'
    }
  ]
})

const features = [
  {
    title: 'Data Santri',
    icon: 'i-heroicons-users',
    description: 'Kelola dan tampilkan data santri dengan profil lengkap, foto, dan informasi detail'
  },
  {
    title: 'Berita & Informasi',
    icon: 'i-heroicons-newspaper',
    description: 'Publikasikan berita dan informasi terbaru untuk santri dan masyarakat'
  },
  {
    title: 'Pencarian Mudah',
    icon: 'i-heroicons-magnifying-glass',
    description: 'Cari santri berdasarkan nama dengan fitur pencarian yang cepat dan akurat'
  },
  {
    title: 'Responsif',
    icon: 'i-heroicons-device-phone-mobile',
    description: 'Akses dari berbagai perangkat dengan tampilan yang optimal'
  },
  {
    title: 'Keamanan Data',
    icon: 'i-heroicons-shield-check',
    description: 'Data santri dan informasi tersimpan dengan aman dan terlindungi'
  },
  {
    title: 'Mudah Digunakan',
    icon: 'i-heroicons-cursor-arrow-rays',
    description: 'Interface yang intuitif dan mudah digunakan untuk semua kalangan'
  }
]

const stats = [
  { value: '500+', label: 'Santri' },
  { value: '50+', label: 'Berita' },
  { value: '24/7', label: 'Akses Online' },
  { value: '100%', label: 'Gratis' }
]
</script>