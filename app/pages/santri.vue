<script setup lang="ts">
</script>

<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-20">
      <div class="max-w-4xl mx-auto">
        <UIcon name="i-heroicons-academic-cap" class="h-20 w-20 text-primary-600 mx-auto mb-8" />
        <h1 class="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Data Santri di dalam <span class="text-primary-600">Sisantri</span>
        </h1>
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Kelola dan pantau informasi santri pondok pesantren Anda dengan mudah dan efisien.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton size="lg" to="/santri" class="text-white">
            <UIcon name="i-heroicons-home" class="mr-2" />
            Beranda Santri
          </UButton>
          <UButton size="lg" variant="outline" to="/blog">
            <UIcon name="i-heroicons-newspaper" class="mr-2" />
            Baca Berita
          </UButton>
        </div>
      </div>
    </section>

    <NuxtPage />
  </div>
</template>

