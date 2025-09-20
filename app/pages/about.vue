<script setup lang="ts">
interface Feature {
  title: string
  description: string
  icon: string
}
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-16">
      <div class="max-w-4xl mx-auto">
        <UIcon name="i-heroicons-academic-cap" class="h-16 w-16 text-primary-600 mx-auto mb-6" />
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Tentang Sisantri
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Sisantri adalah aplikasi web yang dirancang khusus untuk pondok pesantren, 
          memudahkan pengelolaan data santri dan penyebaran berita/informasi terkini.
        </p>
      </div>
    </section>

    <!-- What is Sisantri -->
    <section class="py-16">
      <div class="max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Apa itu Sisantri?
            </h2>
            <div class="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Sisantri membantu pondok pesantren dalam menyimpan, menampilkan, dan mengelola data santri serta berita secara digital. Dengan tampilan yang ramah pengguna, aplikasi ini memudahkan pengunjung untuk mencari informasi santri dan membaca berita terbaru.
              </p>
              <p>
                Aplikasi ini dapat diakses oleh dua tipe pengguna utama: <strong>admin</strong> (pengelola) dan <strong>guest</strong> (pengunjung), dengan fitur yang disesuaikan untuk kebutuhan masing-masing.
              </p>
              <p>
                Dengan teknologi modern dan antarmuka yang intuitif, Sisantri menjadi solusi terbaik untuk modernisasi sistem informasi pondok pesantren.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="bg-primary-50 dark:bg-primary-950 rounded-3xl p-8">
              <div class="grid grid-cols-2 gap-6">
                <div class="text-center">
                  <UIcon name="i-heroicons-users" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Data Santri</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Kelola profil santri</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-heroicons-newspaper" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Berita</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Publikasi informasi</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-heroicons-magnifying-glass" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Pencarian</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Cari dengan mudah</p>
                </div>
                <div class="text-center">
                  <UIcon name="i-heroicons-device-phone-mobile" class="h-12 w-12 text-primary-600 mx-auto mb-3" />
                  <h4 class="font-semibold text-gray-900 dark:text-white">Responsif</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Multi-device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl">
      <div class="max-w-6xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Fitur Unggulan
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Fitur-fitur yang memudahkan pengelolaan pondok pesantren
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

    <!-- Call to Action -->
    <section class="py-16 text-center">
      <div class="max-w-3xl mx-auto space-y-6">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
          Siap untuk memulai?
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Jelajahi data santri atau baca berita terbaru di pondok pesantren Anda sekarang juga.
        </p>
        <div class="space-x-4">
          <UButton to="/santri" color="primary" size="lg">
            <UIcon name="i-heroicons-users" class="mr-2" />
            Cari Data Santri
          </UButton>
          <UButton to="/blogs" variant="outline" color="primary" size="lg">
            <UIcon name="i-heroicons-newspaper" class="mr-2" />
            Baca Berita
            </UButton>
        </div>
      </div>
    </section>
</div>  
</template>