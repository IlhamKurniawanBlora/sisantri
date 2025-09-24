<script setup lang="ts">
interface Props {
  totalBlogs: number
  publishedBlogs: number
  categories: number
  totalViews?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalBlogs: 0,
  publishedBlogs: 0,
  categories: 0,
  totalViews: 0
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <!-- Total Blogs -->
    <UCard>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-file-text" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Blog</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalBlogs }}</p>
        </div>
      </div>
    </UCard>

    <!-- Published Blogs -->
    <UCard>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Terpublikasi</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ publishedBlogs }}</p>
        </div>
      </div>
    </UCard>

    <!-- Categories -->
    <UCard>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-folder" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ categories }}</p>
        </div>
      </div>
    </UCard>

    <!-- Total Views -->
    <UCard>
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
            <UIcon name="i-lucide-eye" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <div class="ml-4">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
          <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalViews.toLocaleString() }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>