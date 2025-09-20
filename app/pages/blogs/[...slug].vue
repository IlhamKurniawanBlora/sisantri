<template>
  <div class="max-w-4xl mx-auto">
    <!-- Loading State -->
    <div v-if="pending" class="space-y-8">
      <USkeleton class="h-8 w-3/4" />
      <USkeleton class="h-4 w-1/2" />
      <USkeleton class="h-64 w-full" />
      <div class="space-y-4">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
      </div>
    </div>

    <!-- Not Found -->
    <div v-else-if="!post" class="text-center py-16">
      <UIcon name="i-heroicons-newspaper" class="h-24 w-24 text-gray-400 mx-auto mb-6" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Artikel Tidak Ditemukan
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Artikel yang Anda cari tidak ditemukan atau telah dihapus.
      </p>
      <UButton to="/blogs" variant="outline">
        <UIcon name="i-heroicons-arrow-left" class="mr-2" />
        Kembali ke Blog
      </UButton>
    </div>

    <!-- Blog Post -->
    <article v-else class="space-y-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm text-gray-500">
        <NuxtLink to="/" class="hover:text-primary-600 transition-colors">
          Beranda
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
        <NuxtLink to="/blogs" class="hover:text-primary-600 transition-colors">
          Blog
        </NuxtLink>
        <UIcon name="i-heroicons-chevron-right" class="h-4 w-4" />
        <span class="text-gray-900 dark:text-white truncate">{{ post.judul }}</span>
      </nav>

      <!-- Article Header -->
      <header class="space-y-6">
        <div class="flex flex-wrap items-center gap-4">
          <UBadge 
            :label="post.kategori" 
            :color="getCategoryColor(post.kategori)"
            variant="subtle"
          />
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <UIcon name="i-heroicons-calendar" class="h-4 w-4" />
            <time :datetime="post.tanggal_publikasi">
              {{ formatDate(post.tanggal_publikasi) }}
            </time>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <UIcon name="i-heroicons-clock" class="h-4 w-4" />
            <span>{{ estimateReadingTime(post.konten) }} menit baca</span>
          </div>
        </div>

        <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          {{ post.judul }}
        </h1>

        <p class="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ post.deskripsi }}
        </p>
      </header>

      <!-- Featured Image -->
      <div v-if="post.gambar" class="relative overflow-hidden rounded-2xl">
        <img
          :src="post.gambar"
          :alt="post.judul"
          class="w-full h-64 md:h-96 object-cover"
        >
      </div>

      <!-- Article Content -->
      <div class="prose prose-lg dark:prose-invert max-w-none">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div v-html="formatContent(post.konten)" class="text-gray-700 dark:text-gray-300 leading-relaxed"></div>
        </div>
      </div>

      <!-- Article Footer -->
      <footer class="border-t border-gray-200 dark:border-gray-800 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <!-- Tags -->
          <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2">
            <span class="text-sm text-gray-500 mr-2">Tags:</span>
            <UBadge
              v-for="tag in post.tags"
              :key="tag"
              :label="tag"
              variant="outline"
              size="sm"
            />
          </div>

          <!-- Share Buttons -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Bagikan:</span>
            <UButton
              variant="ghost"
              size="sm"
              square
              @click="shareOnWhatsApp"
            >
              <UIcon name="i-simple-icons-whatsapp" class="h-4 w-4 text-green-600" />
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              square
              @click="shareOnFacebook"
            >
              <UIcon name="i-simple-icons-facebook" class="h-4 w-4 text-blue-600" />
            </UButton>
            <UButton
              variant="ghost"
              size="sm"
              square
              @click="copyLink"
            >
              <UIcon name="i-heroicons-link" class="h-4 w-4" />
            </UButton>
          </div>
        </div>
      </footer>

      <!-- Navigation -->
      <nav class="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
        <UButton
          v-if="previousPost"
          :to="`/blog/${previousPost.slug}`"
          variant="outline"
          class="w-full md:w-auto"
        >
          <UIcon name="i-heroicons-arrow-left" class="mr-2" />
          {{ previousPost.judul.length > 50 ? previousPost.judul.substring(0, 50) + '...' : previousPost.judul }}
        </UButton>
        
        <UButton to="/blogs" variant="ghost">
          <UIcon name="i-heroicons-squares-2x2" class="mr-2" />
          Semua Artikel
        </UButton>

        <UButton
          v-if="nextPost"
          :to="`/blog/${nextPost.slug}`"
          variant="outline"
          class="w-full md:w-auto"
        >
          {{ nextPost.judul.length > 50 ? nextPost.judul.substring(0, 50) + '...' : nextPost.judul }}
          <UIcon name="i-heroicons-arrow-right" class="ml-2" />
        </UButton>
      </nav>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/types'

const route = useRoute()
const slug = route.params.slug as string

// Fetch blog post
const { data: post, pending } = await useLazyFetch<BlogPost>(`/api/blog/${slug}`, {
  default: () => null
})

// Fetch related posts for navigation
const { data: allPosts } = await useLazyFetch<BlogPost[]>('/api/blog', {
  default: () => []
})

// Previous and next posts
const previousPost = computed(() => {
  if (!allPosts.value || !post.value) return null
  const currentIndex = allPosts.value.findIndex(p => p.slug === post.value.slug)
  return currentIndex > 0 ? allPosts.value[currentIndex - 1] : null
})

const nextPost = computed(() => {
  if (!allPosts.value || !post.value) return null
  const currentIndex = allPosts.value.findIndex(p => p.slug === post.value.slug)
  return currentIndex < allPosts.value.length - 1 ? allPosts.value[currentIndex + 1] : null
})

// SEO
useHead({
  title: computed(() => post.value ? `${post.value.judul} - Sisantri` : 'Artikel Tidak Ditemukan - Sisantri'),
  meta: [
    {
      name: 'description',
      content: computed(() => post.value?.deskripsi || 'Artikel tidak ditemukan')
    },
    {
      property: 'og:title',
      content: computed(() => post.value?.judul || 'Artikel Tidak Ditemukan')
    },
    {
      property: 'og:description',
      content: computed(() => post.value?.deskripsi || 'Artikel tidak ditemukan')
    },
    {
      property: 'og:image',
      content: computed(() => post.value?.gambar || '/default-og-image.jpg')
    },
    {
      property: 'og:type',
      content: 'article'
    }
  ]
})

// Utility functions
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('id-ID', options)
}

const formatContent = (content: string): string => {
  // Simple content formatting - replace newlines with paragraphs
  return content
    .split('\n\n')
    .map(paragraph => `<p>${paragraph.trim()}</p>`)
    .join('')
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

// Share functions
const shareOnWhatsApp = () => {
  const url = encodeURIComponent(window.location.href)
  const text = encodeURIComponent(`${post.value?.judul} - ${post.value?.deskripsi}`)
  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
}

const shareOnFacebook = () => {
  const url = encodeURIComponent(window.location.href)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    // You could add a toast notification here
    console.log('Link copied to clipboard')
  } catch (err) {
    console.error('Failed to copy link:', err)
  }
}

// Handle 404
if (process.client && !pending.value && !post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Artikel tidak ditemukan'
  })
}
</script>