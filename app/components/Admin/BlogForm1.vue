<script setup lang="ts">
import { z } from 'zod'

type Blog = {
  id: string
  slug: string
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  author_id: string
  created_at: string
  updated_at: string
  profiles?: {
    id: string
    full_name: string
    avatar_url: string
  }
}

interface Props {
  blog?: Blog | null
}

interface Emits {
  (e: 'saved'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toast = useToast()

// Form validation schema
const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(200, 'Judul maksimal 200 karakter'),
  description: z.string().min(1, 'Deskripsi wajib diisi').max(500, 'Deskripsi maksimal 500 karakter'),
  content: z.string().min(1, 'Konten wajib diisi'),
  category: z.string().min(1, 'Kategori wajib dipilih'),
  tags: z.array(z.string()).min(1, 'Minimal 1 tag harus dipilih').max(10, 'Maksimal 10 tag')
})

type Schema = z.output<typeof schema>

// Form state (Nuxt UI 4 best practice: use defineModel for v-model)
const state = reactive<Schema>({
  title: props.blog?.title ?? '',
  description: props.blog?.description ?? '',
  content: props.blog?.content ?? '',
  category: props.blog?.category ?? '',
  tags: props.blog?.tags ? [...props.blog.tags] : []
})

// Loading state
const loading = ref(false)

// Category options (no selected property, use v-model for selection)
const categoryOptions = [
  { label: 'Akademik', value: 'Akademik' },
  { label: 'Kegiatan', value: 'Kegiatan' },
  { label: 'Edukasi', value: 'Edukasi' },
  { label: 'Berita', value: 'Berita' }
]

// Tag management
const tagInput = ref('')
const availableTags = [
  'tahfidz', 'quran', 'hafalan', 'santri', 'akademik',
  'kegiatan', 'maulid', 'nabi', 'muhammad', 'peringatan',
  'tips', 'menghafal', 'edukasi', 'berita', 'pesantren'
]

const addTag = () => {
  const tag = tagInput.value.trim().toLowerCase()
  if (tag && !state.tags.includes(tag) && state.tags.length < 10) {
    state.tags = [...state.tags, tag]
    tagInput.value = ''
  }
}

const removeTag = (tagToRemove: string) => {
  state.tags = state.tags.filter(tag => tag !== tagToRemove)
}

const addAvailableTag = (tag: string) => {
  if (!state.tags.includes(tag) && state.tags.length < 10) {
    state.tags = [...state.tags, tag]
  }
}

// Auto-generate slug from title (cleancode)
const generatedSlug = computed(() =>
  state.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
)

// Form submission (cleancode, best practice)
const onSubmit = async () => {
  loading.value = true
  try {
    const payload = {
      ...state,
      slug: generatedSlug.value
    }
    if (props.blog) {
      await $fetch(`/api/blogs/${props.blog.id}`, {
        method: 'PATCH',
        body: payload
      })
    } else {
      await $fetch('/api/blogs', {
        method: 'POST',
        body: payload
      })
    }
    emit('saved')
  } catch (error: any) {
    toast.add({
      title: 'Gagal menyimpan blog',
      description: error?.data?.message || 'Terjadi kesalahan saat menyimpan blog',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Cancel form
const onCancel = () => {
  emit('cancel')
}

// Character counters
const titleLength = computed(() => state.title.length)
const descriptionLength = computed(() => state.description.length)
const contentLength = computed(() => state.content.length)
</script>

<template>
  <div class="space-y-6">
    <UForm :schema="schema" :state="state" @submit="onSubmit" class="space-y-6">
      <!-- Title -->
      <UFormField label="Judul Blog" name="title" required>
        <UInput
          v-model="state.title"
          placeholder="Masukkan judul blog..."
          icon="i-lucide-type"
          :disabled="loading"
        />
        <template #hint>
          <div class="flex justify-between text-xs">
            <span>Judul yang menarik dan informatif</span>
            <span :class="titleLength > 200 ? 'text-red-500' : 'text-gray-400'">
              {{ titleLength }}/200
            </span>
          </div>
        </template>
      </UFormField>

      <!-- Slug Preview -->
      <div v-if="generatedSlug" class="text-sm">
        <span class="text-gray-500 dark:text-gray-400">URL: </span>
        <span class="font-mono text-blue-600 dark:text-blue-400">
          /blogs/{{ generatedSlug }}
        </span>
      </div>

      <!-- Description -->
      <UFormField label="Deskripsi" name="description" required>
        <UTextarea
          v-model="state.description"
          placeholder="Deskripsi singkat tentang blog ini..."
          :rows="3"
          :disabled="loading"
        />
        <template #hint>
          <div class="flex justify-between text-xs">
            <span>Ringkasan singkat yang akan tampil di daftar blog</span>
            <span :class="descriptionLength > 500 ? 'text-red-500' : 'text-gray-400'">
              {{ descriptionLength }}/500
            </span>
          </div>
        </template>
      </UFormField>

      <!-- Category -->
      <UFormField label="Kategori" name="category" required>
        <USelect
          v-model="state.category"
          :items="categoryOptions"
          :disabled="loading"
        >
          <template #leading>
            <UIcon name="i-lucide-folder" class="w-4 h-4 text-gray-400" />
          </template>
        </USelect>
      </UFormField>

      <!-- Tags -->
      <UFormField label="Tags" name="tags" required>
        <!-- Selected Tags -->
        <div v-if="state.tags.length > 0" class="flex flex-wrap gap-2 mb-3">
          <UBadge
            v-for="tag in state.tags"
            :key="tag"
            variant="soft"
            color="info"
            class="flex items-center gap-1"
          >
            {{ tag }}
            <UButton
              icon="i-lucide-x"
              color="info"
              variant="ghost"
              @click="removeTag(tag)"
              :disabled="loading"
            />
          </UBadge>
        </div>

        <!-- Add Tag Input -->
        <div class="flex gap-2 mb-3">
          <UInput
            v-model="tagInput"
            placeholder="Tambah tag..."
            icon="i-lucide-tag"
            @keyup.enter="addTag"
            :disabled="loading || state.tags.length >= 10"
            class="flex-1"
          />
          <UButton
            icon="i-lucide-plus"
            @click="addTag"
            :disabled="!tagInput.trim() || state.tags.length >= 10 || loading"
          />
        </div>

        <!-- Available Tags -->
        <div class="space-y-2">
          <p class="text-sm text-gray-500 dark:text-gray-400">Tag yang tersedia:</p>
          <div class="flex flex-wrap gap-1">
            <UButton
              v-for="tag in availableTags"
              :key="tag"
              :variant="state.tags.includes(tag) ? 'solid' : 'outline'"
              size="xs"
              @click="addAvailableTag(tag)"
              :disabled="state.tags.includes(tag) || state.tags.length >= 10 || loading"
            >
              {{ tag }}
            </UButton>
          </div>
        </div>

        <template #hint>
          <span class="text-xs">
            {{ state.tags.length }}/10 tags dipilih. Tag membantu pembaca menemukan konten Anda.
          </span>
        </template>
      </UFormField>

      <!-- Content -->
      <UFormField label="Konten" name="content" required>
        <UTextarea
          v-model="state.content"
          placeholder="Tulis konten blog Anda di sini... (Mendukung Markdown)"
          :rows="15"
          :disabled="loading"
        />
        <template #hint>
          <div class="flex justify-between text-xs">
            <span>Gunakan Markdown untuk format teks (# untuk heading, ** untuk bold, dll.)</span>
            <span class="text-gray-400">{{ contentLength }} karakter</span>
          </div>
        </template>
      </UFormField>

      <!-- Preview Content -->
      <div v-if="state.content" class="space-y-2">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">Preview:</p>
        <UCard>
          <div class="prose prose-sm dark:prose-invert max-w-none">
            <div class="whitespace-pre-wrap">{{ state.content.substring(0, 500) }}{{ state.content.length > 500 ? '...' : '' }}</div>
          </div>
        </UCard>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          @click="onCancel"
          :disabled="loading"
        >
          <UIcon name="i-lucide-x" class="mr-2" />
          Batal
        </UButton>
        
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading"
        >
          <UIcon name="i-lucide-save" class="mr-2" />
          {{ props.blog ? 'Perbarui' : 'Simpan' }} Blog
        </UButton>
      </div>
    </UForm>
  </div>
</template>