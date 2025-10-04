<script setup lang="ts">
// SEO
useHead({
  title: 'SiDawam',
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
    icon: 'i-lucide-users',
    description: 'Kelola dan tampilkan data santri dengan profil lengkap, foto, dan informasi detail'
  },
  {
    title: 'Berita & Informasi',
    icon: 'i-lucide-newspaper',
    description: 'Publikasikan berita dan informasi terbaru untuk santri dan masyarakat'
  },
  {
    title: 'Pencarian Mudah',
    icon: 'i-lucide-user-search',
    description: 'Cari santri berdasarkan nama dengan fitur pencarian yang cepat dan akurat'
  },
  {
    title: 'Responsif',
    icon: 'i-lucide-smartphone',
    description: 'Akses dari berbagai perangkat dengan tampilan yang optimal'
  },
  {
    title: 'Keamanan Data',
    icon: 'i-lucide-shield-check',
    description: 'Data santri dan informasi tersimpan dengan aman dan terlindungi'
  },
  {
    title: 'Mudah Digunakan',
    icon: 'i-lucide-user-check',
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

<template>
  <div class="space-y-16">
    <CarouselDisplay />
    <section class="py-16">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Fitur Utama <span class="text-primary-600 dark:text-primary-400">SiDawam</span>
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
    <SantriPreview class="py-16" />
    <BlogPreview class="py-16" />

    <!-- CTA Section -->
    <section class="py-16 text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Mulai Jelajahi <span class="text-primary-600 dark:text-primary-400">SiDawam</span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Temukan informasi santri dan berita terbaru dari pondok pesantren
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton 
            size="lg" 
            variant="outline" 
            to="/about"
            class="w-full sm:w-auto px-8 py-3 sm:px-6 sm:py-2"
          >
            <UIcon name="i-lucide-info" class="mr-2 h-5 w-5" />
            Pelajari Lebih Lanjut
          </UButton>
        </div>
      </div>
    </section>
  </div>
</template>

