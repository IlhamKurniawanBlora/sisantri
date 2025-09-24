<script setup lang="ts">
const { data, refresh } = await useFetch('/api/carousel')

// fallback jika kosong
const slides = computed(() => data.value || [])
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <UCarousel
      v-if="slides.length"
      :items="slides"
      class="h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl shadow-lg"
      indicators
      arrows
      autoplay
      loop
    >
      <template #item="{ item }">
        <div class="relative h-full w-full">
          <img
            :src="item.image_url"
            alt="Carousel"
            class="h-full w-full object-cover"
          />
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 class="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
              Selamat datang di
              <span class="text-primary-400">SiDawam</span>
            </h2>
          </div>
        </div>
      </template>
    </UCarousel>

    <!-- fallback jika kosong -->
    <div v-else class="flex h-[400px] items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-2xl">
      <p class="text-gray-500 dark:text-gray-300">Belum ada gambar carousel</p>
    </div>
  </section>
</template>
