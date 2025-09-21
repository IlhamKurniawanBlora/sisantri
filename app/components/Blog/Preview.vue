<script setup lang="ts">
import { computed } from 'vue'

const { data: res, pending, error, refresh } = await useAsyncData(
  'blogs-preview',
  () => $fetch('/api/blogs/?page=1&limit=3&sort=newest'),
  {
    server: true
  }
)

const blogs = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)
</script>

<template>
  <!-- Blog Preview Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full mb-4">
          <UIcon name="i-heroicons-document-text" class="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Blog <span class="text-primary-600 dark:text-primary-400">Terbaru</span>
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Baca artikel dan cerita menarik seputar kehidupan santri dan pesantren
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="space-y-6">
        <div v-for="i in 3" :key="i" class="animate-pulse">
          <div class="bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12">
        <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Gagal Memuat Artikel
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Terjadi kesalahan saat memuat artikel blog
        </p>
        <UButton @click="refresh" variant="outline" size="sm">
          <UIcon name="i-heroicons-arrow-path" class="mr-2" />
          Coba Lagi
        </UButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="blogs.length === 0" class="text-center py-12">
        <UIcon name="i-heroicons-document-text" class="h-8 w-8 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Belum Ada Artikel
        </h3>
        <p class="text-gray-600 dark:text-gray-300">
          Belum ada artikel blog yang dipublikasikan
        </p>
      </div>

      <!-- Blog Cards -->
      <div v-else>
        <div class="space-y-8 mb-12">
          <BlogCard
            v-for="(item, idx) in blogs"
            :key="item.id || idx"
            :title="item.title"
            :description="item.description"
            :image="item.image"
            :date="item.created_at"
            :to="`/blogs/${item.slug}`"
            :author-name="item.profiles?.full_name"
            :author-avatar="item.profiles?.avatar_url"
            :blog="item"
            class="hover:transform hover:scale-[1.02] transition-transform duration-200"
          />
        </div>

        <!-- View More Section -->
        <div class="text-center">
          <UButton 
            to="/blogs" 
            size="lg"
            class="text-white"
          >
            Lihat Selengkapnya
            <UIcon name="i-lucide-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </div>
    </div>
</template>