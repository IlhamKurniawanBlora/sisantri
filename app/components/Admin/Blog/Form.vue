<script setup lang="ts">
import { reactive, computed, watch, resolveComponent, ref, onBeforeUnmount } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UTextarea = resolveComponent('UTextarea')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')

const props = defineProps<{
  mode: 'add' | 'edit'
  blog?: any
}>()

const emit = defineEmits<{
  saved: [data?: any]
  close: []
}>()

// Use $fetch directly from Nuxt's global
const toast = useToast()
const loading = ref(false)

const formState = reactive({
  title: '',
  slug: '',
  description: '',
  content: '',
  category: 'akademik',
  tags: [] as string[],
  tagInput: '',
  image_url: '',
  file: null as File | null,
  previewUrl: null as string | null
})

// Initialize form data for edit mode
if (props.mode === 'edit' && props.blog) {
  Object.assign(formState, {
    title: props.blog.title || '',
    slug: props.blog.slug || '',
    description: props.blog.description || '',
    content: props.blog.content || '',
    category: props.blog.category || 'akademik',
    tags: Array.isArray(props.blog.tags) ? props.blog.tags : [],
    image_url: props.blog.image_url || '',
    previewUrl: props.blog.image_url || null
  })
}

const categoryOptions = [
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Edukasi', value: 'edukasi' },
  { label: 'Berita', value: 'berita' },
  { label: 'Pengumuman', value: 'pengumuman' }
]

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
}

// Auto-generate slug only for add mode
watch(() => formState.title, (newTitle) => {
  if (props.mode === 'add' && newTitle) {
    formState.slug = generateSlug(newTitle)
  }
})

const isFormValid = computed(() => {
  return formState.title && formState.slug && formState.category && formState.content && formState.description
})

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.add({
        title: 'File tidak valid',
        description: 'Hanya file gambar yang diperbolehkan',
        color: 'error'
      })
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: 'File terlalu besar',
        description: 'Ukuran file maksimal 5MB',
        color: 'error'
      })
      return
    }
    
    formState.file = file
    
    // Create preview URL
    if (formState.previewUrl && formState.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(formState.previewUrl)
    }
    formState.previewUrl = URL.createObjectURL(file)
  }
}

function handleTagInput(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function addTag() {
  const tag = formState.tagInput.trim().toLowerCase()
  if (tag && !formState.tags.includes(tag)) {
    formState.tags.push(tag)
    formState.tagInput = ''
  }
}

function removeTag(index: number) {
  formState.tags.splice(index, 1)
}

async function handleSubmit() {
  if (!isFormValid.value) {
    toast.add({
      title: 'Form tidak lengkap',
      description: 'Silakan lengkapi semua field yang wajib diisi',
      color: 'error'
    })
    return
  }

  loading.value = true
  
  try {
    const formData = new FormData()
    formData.append('title', formState.title)
    formData.append('slug', formState.slug)
    formData.append('description', formState.description)
    formData.append('content', formState.content)
    formData.append('category', formState.category)
    formData.append('tags', JSON.stringify(formState.tags))

    if (formState.file) {
      formData.append('file', formState.file)
    }
    formData.append('image_url', formState.image_url || '')


    let url = '/api/blogs'
    let method = 'POST'
    if (props.mode === 'edit' && props.blog?.id) {
      formData.append('id', props.blog.id)
    }

    const response = await $fetch(url, {
      method,
      body: formData
    })
    toast.add({
      title: props.mode === 'edit' ? 'Blog berhasil diperbarui!' : 'Blog berhasil ditambahkan!',
      color: 'success'
    })
    emit('saved', response.data)
  } catch (error: any) {
    console.error('Form submission error:', error)

    let errorMessage = 'Terjadi kesalahan'

    if (error?.data?.statusMessage) {
      errorMessage = error.data.statusMessage
    } else if (error?.data?.message) {
      errorMessage = error.data.message
    } else if (error?.statusMessage) {
      errorMessage = error.statusMessage
    } else if (error?.message) {
      errorMessage = error.message
    }

    toast.add({
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} blog`,
      description: errorMessage,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Cleanup preview URL on unmount
onBeforeUnmount(() => {
  if (formState.previewUrl && formState.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(formState.previewUrl)
  }
})
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6 w-full">
    <!-- Image Upload -->
    <UFormField label="Gambar Utama" name="image" class="w-full">
      <UInput 
        type="file" 
        accept="image/*" 
        @change="handleFileChange"
        class="mb-3 w-full"
      />
      <div v-if="formState.previewUrl" class="mt-3 w-full">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        <img 
          :src="formState.previewUrl" 
          alt="Preview"
          class="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>
    </UFormField>

    <!-- Title -->
    <UFormField label="Judul Blog" name="title" required class="w-full">
      <UInput 
        v-model="formState.title" 
        placeholder="Masukkan judul blog"
        class="w-full"
        :disabled="loading"
      />
    </UFormField>

    <!-- Slug -->
    <UFormField label="Slug" name="slug" required class="w-full">
      <UInput 
        v-model="formState.slug" 
        placeholder="url-friendly-slug"
        :disabled="mode === 'edit' || loading"
        class="w-full"
      />
      <template #help>
        URL berita akan menjadi: /blogs/{{ formState.slug }}
      </template>
    </UFormField>

    <!-- Category -->
    <UFormField label="Kategori" name="category" required class="w-full">
      <USelect 
        v-model="formState.category" 
        :items="categoryOptions"
        placeholder="Pilih kategori"
        class="w-full"
        :disabled="loading"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Deskripsi" name="description" required class="w-full">
      <UTextarea 
        v-model="formState.description" 
        placeholder="Masukkan deskripsi singkat berita"
        :rows="3"
        class="w-full"
        :disabled="loading"
      />
    </UFormField>

    <!-- Tags -->
    <UFormField label="Tags" name="tags" class="w-full">
      <div class="space-y-3 w-full">
        <UInput 
          v-model="formState.tagInput" 
          placeholder="Ketik tag dan tekan Enter atau koma"
          @keydown="handleTagInput"
          class="w-full"
          :disabled="loading"
        />
        <div v-if="formState.tags.length > 0" class="flex flex-wrap gap-2 w-full">
          <UBadge
            v-for="(tag, index) in formState.tags"
            :key="index"
            variant="outline"
            color="primary"
            class="flex items-center gap-1"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              :disabled="loading"
              class="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
            >
              <UIcon name="i-lucide-x" class="w-3 h-3" />
            </button>
          </UBadge>
        </div>
      </div>
    </UFormField>

    <!-- Content -->
    <UFormField label="Konten Blog" name="content" required class="w-full">
      <UTextarea 
        v-model="formState.content" 
        placeholder="Tulis konten blog di sini..."
        :rows="10"
        class="w-full"
        :disabled="loading"
      />
      <template #help>
        Anda bisa menggunakan HTML untuk formatting konten
      </template>
    </UFormField>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 pt-6 w-full">
      <UButton 
        variant="outline" 
        @click="emit('close')"
        :disabled="loading"
      >
        Batal
      </UButton>
      <UButton 
        type="submit"
        :loading="loading"
        :disabled="!isFormValid || loading"
        color="primary"
      >
        {{ mode === 'add' ? 'Publikasikan' : 'Update Blog' }}
      </UButton>
    </div>
  </UForm>
</template>