<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

defineProps<{
  prevIcon?: string
  nextIcon?: string
}>()

const { data, refresh, pending, error } = useFetch('/api/carousel')

// Current active slide index
const currentIndex = ref(0)

// Map slides to ensure compatibility with the template
const items = computed(() => {
  // Handle nested data structure from API response
  const carouselData = data.value?.data || []
  return carouselData.map((item: any) => ({
    id: item.id,
    url: item.image_url,
    title: item.title || '',
    description: item.description || ''
  }))
})

// Update current index
const updateIndex = (index: number) => {
  currentIndex.value = index
}

onMounted(() => {
  refresh()
})
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="pending" class="w-full max-w-5xl mx-auto">
      <div class="relative overflow-hidden rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse">
        <div class="w-full h-[400px] md:h-[550px] lg:h-[650px]"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="w-full max-w-5xl mx-auto p-8 text-center">
      <div class="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6">
        <p class="text-red-600 dark:text-red-400">Failed to load carousel images</p>
        <UButton @click="refresh" color="error" variant="soft" class="mt-4">
          Try Again
        </UButton>
      </div>
    </div>

    <!-- Carousel -->
    <UCarousel
      v-else-if="items.length > 0"
      v-slot="{ item, index }"
      arrows
      dots
      loop
      :duration="400"
      :drag-free="false"
      :align="'center'"
      :autoplay="{ 
        delay: 1000, 
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        playOnInit: true
      }"
      :prev-icon="prevIcon || 'i-lucide-chevron-left'"
      :next-icon="nextIcon || 'i-lucide-chevron-right'"
      :prev="{ 
        color: 'neutral', 
        variant: 'soft', 
        size: 'xl',
        class: 'shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/30 transition-all duration-300 ease-out transform hover:scale-110 opacity-0 group-hover:opacity-100' 
      }"
      :next="{ 
        color: 'neutral', 
        variant: 'soft', 
        size: 'xl',
        class: 'shadow-2xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/30 transition-all duration-300 ease-out transform hover:scale-110 opacity-0 group-hover:opacity-100' 
      }"
      :items="items"
      :ui="{
        root: 'relative focus:outline-none will-change-transform group',
        viewport: 'overflow-hidden will-change-transform',
        container: 'flex transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
        item: 'min-w-0 shrink-0 basis-full will-change-transform',
        prev: 'left-4 md:left-8 z-20 transition-all duration-300 ease-out',
        next: 'right-4 md:right-8 z-20 transition-all duration-300 ease-out',
        dots: '-bottom-12 gap-2.5 z-10',
        dot: 'w-2.5 h-2.5 rounded-full transition-all duration-300 ease-out hover:scale-125 cursor-pointer bg-white/40 hover:bg-white/70 data-[state=active]:bg-white data-[state=active]:w-8 data-[state=active]:scale-100'
      }"
      class="w-full max-w-5xl mx-auto relative pb-16"
      @update:model-value="updateIndex"
    >
      <div class="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] will-change-transform">
        <!-- Main Image -->
        <img 
          :src="item.url" 
          :alt="item.title || `Carousel image ${index + 1}`"
          class="w-full h-[350px] md:h-[500px] lg:h-[600px] object-cover transition-all duration-500 ease-out group-hover:scale-105 will-change-transform"
          loading="lazy"
          decoding="async"
        >
        
        <!-- Gradient Overlays -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity duration-500"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 opacity-50"></div>
        
        <!-- Content Overlay (if title or description exists) -->
        <div 
          v-if="item.title || item.description"
          class="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 transform transition-transform duration-500"
        >
          <div class="max-w-3xl">
            <h3 
              v-if="item.title"
              class="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-2xl animate-fade-in-up"
            >
              {{ item.title }}
            </h3>
            <p 
              v-if="item.description"
              class="text-sm md:text-lg text-white/90 line-clamp-2 drop-shadow-lg animate-fade-in-up animation-delay-100"
            >
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Corner Accent -->
        <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <!-- Inner Shadow for Depth -->
        <div class="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] rounded-2xl md:rounded-3xl pointer-events-none"></div>
      </div>
    </UCarousel>

    <!-- Empty State -->
    <div v-else class="w-full max-w-5xl mx-auto p-8 text-center">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-12">
        <div class="text-6xl mb-4 opacity-30">🖼️</div>
        <p class="text-gray-600 dark:text-gray-400 text-lg">No carousel images available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease-out forwards;
}

.animation-delay-100 {
  animation-delay: 0.1s;
  opacity: 0;
}
</style>