<script setup lang="ts">
import { ref } from 'vue'

const route = useRoute()
const slug = route.params.slug as string

// Fetch blog data
const { data: res, pending, error, refresh } = await useAsyncData(
  `blog-${slug}`,
  () => $fetch(`/api/blogs/${slug}`)
)

const blog = computed(() => res.value?.data)

// Handle error states
if (error.value) {
  throw createError({
    statusCode: error.value.statusCode || 404,
    statusMessage: error.value.statusMessage || 'Blog not found'
  })
}

// SEO Meta
useHead({
  title: () => blog.value?.title || 'Blog Post',
  meta: [
    {
      name: 'description',
      content: () => blog.value?.description || 'Read this blog post'
    },
    {
      property: 'og:title',
      content: () => blog.value?.title || 'Blog Post'
    },
    {
      property: 'og:description',
      content: () => blog.value?.description || 'Read this blog post'
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      property: 'og:image',
      content: () => blog.value?.image_url || ''
    }
  ]
})

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Reading time calculation
const calculateReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

// Share functions
const shareUrl = computed(() => {
  if (process.client) {
    return window.location.href
  }
  return ''
})

const toast = useToast()

const shareOnTwitter = () => {
  const text = `${blog.value?.title} - ${blog.value?.description}`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank')
}

const shareOnFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank')
}

const shareOnLinkedIn = () => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toast.add({
      title: 'Link berhasil disalin!',
      description: 'Link artikel telah disalin ke clipboard',
      icon: 'i-lucide-clipboard-check',
    })
  } catch (err) {
    toast.add({
      title: 'Gagal menyalin link',
      description: 'Terjadi kesalahan saat menyalin link',
      icon: 'i-lucide-clipboard-x',
      color: 'error'
    })
  }
}

// Parse markdown content to HTML
const parseMarkdown = (content: string) => {
  return content
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-5">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>')
    .replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
    .replace(/\n\n/gim, '</p><p class="mb-4">')
    .replace(/\r\n/gim, '<br>')
}

const formattedContent = computed(() => {
  if (!blog.value?.content) return ''
  return `<p class="mb-4">${parseMarkdown(blog.value.content)}</p>`
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="pending" class="max-w-4xl mx-auto">
      <USkeleton class="h-8 w-3/4 mb-4" />
      <USkeleton class="h-4 w-1/2 mb-6" />
      <USkeleton class="h-64 w-full mb-6" />
      <div class="space-y-3">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-5/6" />
      </div>
    </div>

    <!-- Blog Content -->
    <article v-else-if="blog" class="max-w-4xl mx-auto">
      <!-- Breadcrumb -->
      <UBreadcrumb 
        :links="[
          { label: 'Home', to: '/' },
          { label: 'Blog', to: '/blogs' },
          { label: blog.title, to: `/blogs/${blog.slug}` }
        ]"
        class="mb-8"
      />

      <!-- Header -->
      <header class="mb-8">
        <!-- Category Badge -->
        <div class="mb-4">
          <UBadge 
            v-if="blog.category" 
            :label="blog.category" 
            color="primary" 
            variant="subtle"
            size="sm"
          />
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
          {{ blog.title }}
        </h1>

        <!-- Description -->
        <p class="text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {{ blog.description }}
        </p>

        <!-- Featured Image -->
        <div v-if="blog.image_url" class="mb-6">
          <div class="relative overflow-hidden rounded-lg shadow-lg">
            <img 
              :src="blog.image_url" 
              :alt="blog.title"
              class="w-full h-auto max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <!-- Meta Info Card -->
        <UCard class="mb-6">
          <div class="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <!-- Author -->
            <div class="flex items-center gap-2">
              <UAvatar 
                :src="blog.profiles?.avatar_url" 
                :alt="blog.profiles?.full_name || 'Author'"
                size="sm"
                :ui="{ placeholder: 'flex items-center justify-center bg-gray-500 dark:bg-gray-400' }"
              >
                <UIcon name="i-lucide-user" v-if="!blog.profiles?.avatar_url" />
              </UAvatar>
              <span class="font-medium">{{ blog.profiles?.full_name || 'admin SiDawam' }}</span>
            </div>

            <!-- Date -->
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="text-primary-500" />
              <time :datetime="blog.created_at">
                {{ formatDate(blog.created_at) }}
              </time>
            </div>

            <!-- Reading Time -->
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="text-primary-500" />
              <span>{{ calculateReadingTime(blog.content || '') }} menit baca</span>
            </div>

            <!-- Views -->
            <div v-if="blog.views" class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="text-primary-500" />
              <span>{{ blog.views.toLocaleString() }} views</span>
            </div>
          </div>
        </UCard>

        <!-- Tags -->
        <div v-if="blog.tags && blog.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
          <UBadge
            v-for="tag in blog.tags"
            :key="tag"
            :label="`#${tag}`"
            color="neutral"
            variant="soft"
            size="sm"
          />
        </div>

        <!-- Share Buttons -->
        <UCard>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bagikan artikel:
            </span>
            <div class="flex gap-2">
              <UButton
                @click="shareOnTwitter"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-simple-icons-twitter"
                aria-label="Bagikan di Twitter"
              />
              <UButton
                @click="shareOnFacebook"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-simple-icons-facebook"
                aria-label="Bagikan di Facebook"
              />
              <UButton
                @click="shareOnLinkedIn"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-simple-icons-linkedin"
                aria-label="Bagikan di LinkedIn"
              />
              <UButton
                @click="copyLink"
                color="neutral"
                variant="ghost"
                size="sm"
                icon="i-lucide-link"
                aria-label="Salin link"
              />
            </div>
          </div>
        </UCard>
      </header>

      <!-- Content -->
      <UCard class="mb-8">
        <div class="prose prose-lg dark:prose-invert max-w-none">
          <div v-html="formattedContent" class="leading-relaxed"></div>
        </div>
      </UCard>

      <!-- Footer -->
      <footer class="space-y-6">
        <!-- Author Bio -->
        <UCard v-if="blog.profiles">
          <div class="flex items-start gap-2">
            <UAvatar 
              :src="blog.profiles.avatar_url" 
              :alt="blog.profiles.full_name"
              size="lg"
              :ui="{ placeholder: 'flex items-center justify-center bg-gray-500 dark:bg-gray-400' }"
            >
              <UIcon name="i-lucide-user" v-if="!blog.profiles.avatar_url" class="w-8 h-8" />
            </UAvatar>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {{ blog.profiles.full_name }}
              </h3>
              <p v-if="blog.profiles.bio" class="text-gray-600 dark:text-gray-300 text-sm">
                {{ blog.profiles.bio }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Back to Blog -->
        <div class="text-center">
          <UButton
            to="/blogs"
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-left"
          >
            Kembali ke Blog
          </UButton>
        </div>
      </footer>
    </article>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-2xl mx-auto text-center py-12">
      <UIcon name="i-lucide-info" class="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Blog tidak ditemukan
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6">
        Maaf, artikel yang Anda cari tidak dapat ditemukan.
      </p>
      <UButton to="/blogs" color="primary">
        Kembali ke Blog
      </UButton>
    </div>

    <!-- Toast Notifications -->
    <UNotifications />
  </div>
</template>