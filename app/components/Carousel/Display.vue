<script setup lang="ts">
defineProps<{
  prevIcon?: string
  nextIcon?: string
}>()

import { computed, watchEffect } from 'vue'
const { data, refresh } = useFetch('/api/carousel')

// Map slides to ensure compatibility with the template
const items = computed(() => {
  return (data.value || []).map((item) => item.image_url)
})

// Debugging: Log the data fetched from the API
watchEffect(() => {
  console.log('Fetched carousel items:', items.value)
})
</script>

<template>
  <UCarousel
    v-slot="{ item }"
    arrows
    dots
    loop
    :duration="40"
    :drag-free="false"
    :align="'center'"
    :autoplay="{ 
      delay: 5000, 
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true
    }"
    :prev-icon="prevIcon || 'i-lucide-chevron-left'"
    :next-icon="nextIcon || 'i-lucide-chevron-right'"
    :prev="{ 
      color: 'neutral', 
      variant: 'ghost', 
      size: 'xl',
      class: 'shadow-xl backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/20 transition-all duration-500 ease-out transform hover:scale-110 opacity-80 hover:opacity-100' 
    }"
    :next="{ 
      color: 'neutral', 
      variant: 'ghost', 
      size: 'xl',
      class: 'shadow-xl backdrop-blur-md bg-black/20 hover:bg-black/40 border border-white/20 transition-all duration-500 ease-out transform hover:scale-110 opacity-80 hover:opacity-100' 
    }"
    :items="items"
    :ui="{
      root: 'relative focus:outline-none will-change-transform',
      viewport: 'overflow-hidden will-change-transform',
      container: 'flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
      item: 'min-w-0 shrink-0 basis-full will-change-transform',
      prev: 'left-6 z-20 transition-all duration-500 ease-out',
      next: 'right-6 z-20 transition-all duration-500 ease-out',
      dots: '-bottom-10 gap-3 z-10',
      dot: 'w-2 h-2 rounded-full transition-all duration-500 ease-out hover:scale-125 cursor-pointer bg-white/50 hover:bg-white/80 data-[state=active]:bg-white data-[state=active]:scale-110'
    }"
    class="w-full max-w-5xl mx-auto relative pb-16"
  >
    <div class="relative group overflow-hidden rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] will-change-transform">
      <img 
        :src="item" 
        :alt="`Carousel image`"
        class="w-full h-[400px] md:h-[550px] lg:h-[650px] object-cover transition-all duration-1000 ease-out group-hover:scale-[1.02] will-change-transform"
        loading="lazy"
        decoding="async"
      >
      <!-- Enhanced overlay with smoother transitions -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700 ease-out"></div>
      
      <!-- Subtle inner shadow for depth -->
      <div class="absolute inset-0 shadow-inner rounded-3xl pointer-events-none"></div>
    </div>
  </UCarousel>
</template>