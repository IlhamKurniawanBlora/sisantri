<template>
  <UCard class="hover:shadow-lg transition-shadow duration-200 cursor-pointer group h-full flex flex-col" @click="navigateToPost">
    <!-- Image -->
    <div class="relative overflow-hidden">
      <img
        v-if="post.gambar"
        :src="post.gambar"
        :alt="post.judul"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
      >
      <div
        v-else
        class="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      >
        <UIcon name="i-heroicons-newspaper" class="h-12 w-12 text-gray-400" />
      </div>
      
      <!-- Category Badge -->
      <div class="absolute top-3 left-3">
        <UBadge 
          :label="post.kategori"
          :color="getCategoryColor(post.kategori)"
          variant="solid"
          size="sm"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 flex-1 flex flex-col">
      <!-- Meta Info -->
      <div class="flex items-center space-x-4 text-sm text-gray-500 mb-3">
        <div class="flex items-center space-x-1">
          <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
          <time :datetime="post.tanggal_publikasi">
            {{ formatDate(post.tanggal_publikasi) }}
          </time>
        </div>
        <div class="flex items-center space-x-1">
          <UIcon name="i-heroicons-clock" class="h-4 w-4" />
          <span>{{ estimateReadingTime(post.konten) }} min</span>
        </div>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 flex-shrink-0">
        {{ post.judul }}
      </h3>

      <!-- Description -->
      <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 flex-1 mb-4">
        {{ post.deskripsi }}
      </p>

      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1 mb-4">
        <UBadge
          v-for="tag in post.tags.slice(0, 2)"
          :key="tag"
          :label="tag"
          variant="outline"
          size="xs"
        />
        <UBadge
          v-if="post.tags.length > 2"
          :label="`+${post.tags.length - 2}`"
          variant="outline"
          size="xs"
          color="gray"
        />
      </div>

      <!-- Read More -->
      <div class="mt-auto">
        <UButton 
          variant="ghost" 
          size="sm" 
          class="w-full justify-between group-hover:bg-primary-50 dark:group-hover:bg-primary-950 transition-colors"
          @click.stop="navigateToPost"
        >
          Baca Selengkapnya
          <UIcon name="i-heroicons-arrow-right" class="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types'

interface Props {
  post: BlogPost
}

const props = defineProps<Props>()

const router = useRouter()

const navigateToPost = () => {
  router.push(`/blog/${props.post.slug}`)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    return 'Kemarin'
  } else if (diffDays <= 7) {
    return `${diffDays} hari lalu`
  } else {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('id-ID', options)
  }
}

const estimateReadingTime = (content: string): number => {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'pengumuman': 'red',
    'kegiatan': 'blue',
    'prestasi': 'green',
    'lainnya': 'gray'
  }
  return colors[category] || 'gray'
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>