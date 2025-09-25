<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCard = resolveComponent('UCard')

const props = defineProps<{
  blog: {
    id: string
    slug: string
    title: string
    description: string
    content?: string
    category: string
    tags: string[]
    author_id: string
    created_at: string
    updated_at: string
    deleted_at?: string
    profiles: {
      id: string
      full_name: string
      avatar_url: string
    }
  }
}>()

// Computed properties
const categoryInfo = computed(() => {
  const colorMap = {
    'akademik': { color: 'blue', label: 'Akademik' },
    'kegiatan': { color: 'green', label: 'Kegiatan' },
    'edukasi': { color: 'purple', label: 'Edukasi' },
    'berita': { color: 'yellow', label: 'Berita' },
    'pengumuman': { color: 'red', label: 'Pengumuman' }
  }
  
  return colorMap[props.blog.category as keyof typeof colorMap] || { color: 'neutral', label: props.blog.category }
})

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content: string, maxLength: number = 500) => {
  if (!content) return '-'
  const stripped = content.replace(/<[^>]*>/g, '')
  return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <UCard>
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white break-words">
              {{ blog.title }}
            </h3>
            <p class="text-lg text-gray-600 dark:text-gray-400 mt-2 break-words">
              {{ blog.description }}
            </p>
          </div>
          <UBadge 
            :color="categoryInfo.color" 
            variant="subtle" 
            size="lg"
            class="ml-4 flex-shrink-0"
          >
            {{ categoryInfo.label }}
          </UBadge>
        </div>
        
        <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-link" class="w-4 h-4" />
            <span class="font-mono break-all">{{ blog.slug }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Author Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-user" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Penulis</h4>
        </div>
      </template>

      <div class="flex items-center gap-4">
        <img 
          :src="blog.profiles?.avatar_url || 'https://placehold.co/64x64?text=?'"
          :alt="blog.profiles?.full_name"
          class="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
        />
        <div>
          <h5 class="font-medium text-gray-900 dark:text-white text-lg">
            {{ blog.profiles?.full_name || 'Unknown Author' }}
          </h5>
          <p class="text-gray-500 dark:text-gray-400">
            Author ID: {{ blog.author_id }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- Tags -->
    <UCard v-if="blog.tags && blog.tags.length > 0">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-tags" class="w-5 h-5" />
          <h4 class="font-semibold">Tags</h4>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UBadge 
          v-for="tag in blog.tags" 
          :key="tag"
          variant="outline"
          color="primary"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>
    </UCard>

    <!-- Content Preview -->
    <UCard v-if="blog.content">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="w-5 h-5" />
          <h4 class="font-semibold">Preview Konten</h4>
        </div>
      </template>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-h-96 overflow-y-auto">
        <!-- Raw HTML content preview -->
        <div 
          v-if="blog.content.includes('<')"
          class="prose dark:prose-invert max-w-none"
          v-html="blog.content"
        ></div>
        <!-- Plain text content -->
        <div v-else class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ blog.content }}
        </div>
      </div>
      
      <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Karakter: {{ blog.content.length }} | 
        Kata: {{ blog.content.split(/\s+/).length }}
      </div>
    </UCard>

    <!-- SEO Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-search" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi SEO</h4>
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-500 dark:text-gray-400">URL Blog</label>
          <p class="mt-1 text-sm font-mono text-gray-900 dark:text-white break-all">
            /blogs/{{ blog.slug }}
          </p>
        </div>
        
        <div>
          <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Meta Description</label>
          <p class="mt-1 text-sm text-gray-900 dark:text-white">
            {{ blog.description }}
          </p>
        </div>

        <div v-if="blog.tags && blog.tags.length > 0">
          <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Keywords</label>
          <p class="mt-1 text-sm text-gray-900 dark:text-white">
            {{ blog.tags.join(', ') }}
          </p>
        </div>
      </div>
    </UCard>

    <!-- System Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Sistem</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dibuat</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(blog.created_at) }}
          </dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Diperbarui</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(blog.updated_at) }}
          </dd>
        </div>
        
        <div v-if="blog.deleted_at">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dihapus</dt>
          <dd class="mt-1 text-red-600 dark:text-red-400">
            {{ formatDate(blog.deleted_at) }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd class="mt-1">
            <UBadge 
              :color="blog.deleted_at ? 'red' : 'green'" 
              variant="subtle"
            >
              {{ blog.deleted_at ? 'Dihapus' : 'Aktif' }}
            </UBadge>
          </dd>
        </div>
      </div>
    </UCard>
  </div>
</template>