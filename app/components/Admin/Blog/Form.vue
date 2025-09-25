<script setup lang="ts">
import { reactive, computed, watch, resolveComponent } from 'vue'

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
  saved: []
  close: []
}>()

const toast = useToast()
const loading = ref(false)

// Form state
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

// Initialize form with blog data if editing
if (props.mode === 'edit' && props.blog) {
  Object.assign(formState, {
    title: props.blog.title || '',
    slug: props.blog.slug || '',
    description: props.blog.description || '',
    content: props.blog.content || '',
    category: props.blog.category || 'akademik',
    tags: props.blog.tags || [],
    image_url: props.blog.image_url || '',
    previewUrl: props.blog.image_url || null
  })
}

// Category options
const categoryOptions = [
  { label: 'Akademik', value: 'akademik' },
  { label: 'Kegiatan', value: 'kegiatan' },
  { label: 'Edukasi', value: 'edukasi' },
  { label: 'Berita', value: 'berita' },
  { label: 'Pengumuman', value: 'pengumuman' }
]

// Generate slug from title
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Watch title changes to auto-generate slug
watch(() => formState.title, (newTitle) => {
  if (props.mode === 'add' && newTitle) {
    formState.slug = generateSlug(newTitle)
  }
})

// Form validation
const isFormValid = computed(() => {
  return formState.title && formState.slug && formState.category && formState.content && formState.description
})

// Handle file change
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formState.file = target.files[0]
    formState.previewUrl = URL.createObjectURL(target.files[0])
  }
}

// Handle tag input
function handleTagInput(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addTag()
  }
}

function addTag() {
  const tag = formState.tagInput.trim()
  if (tag && !formState.tags.includes(tag)) {
    formState.tags.push(tag)
    formState.tagInput = ''
  }
}

function removeTag(index: number) {
  formState.tags.splice(index, 1)
}

// Handle form submission
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
    
    // Append form data
    Object.entries(formState).forEach(([key, value]) => {
      if (key !== 'file' && key !== 'previewUrl' && key !== 'tagInput' && value !== null && value !== '') {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
    })
    
    // Append file if present
    if (formState.file) {
      formData.append('file', formState.file)
    }

    const url = props.mode === 'edit' ? `/api/blogs/${props.blog.slug}` : '/api/blogs'
    const method = props.mode === 'edit' ? 'PUT' : 'POST'
    
    await $fetch(url, {
      method,
      body: formData
    })

    toast.add({
      title: props.mode === 'edit' ? 'Blog berhasil diperbarui!' : 'Blog berhasil ditambahkan!',
      color: 'success'
    })

    emit('saved')
  } catch (error: any) {
    toast.add({
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} blog`,
      description: error?.data?.message || error.message || 'Terjadi kesalahan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6 w-full">
    <!-- Featured Image -->
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

    <UFormField label="Judul Blog" name="title" required class="w-full">
      <UInput 
        v-model="formState.title" 
        placeholder="Masukkan judul blog"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Slug" name="slug" required class="w-full">
      <UInput 
        v-model="formState.slug" 
        placeholder="url-friendly-slug"
        :disabled="mode === 'edit'"
        class="w-full"
      />
      <template #help>
        URL blog akan menjadi: /blogs/{{ formState.slug }}
      </template>
    </UFormField>
    
    <UFormField label="Kategori" name="category" required class="w-full">
      <USelect 
        v-model="formState.category" 
        :options="categoryOptions"
        placeholder="Pilih kategori"
        class="w-full"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Deskripsi" name="description" required class="w-full">
      <UTextarea 
        v-model="formState.description" 
        placeholder="Masukkan deskripsi singkat blog"
        rows="3"
        class="w-full"
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
              class="ml-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
        rows="10"
        class="w-full"
      />
      <template #help>
        Anda bisa menggunakan HTML untuk formatting konten
      </template>
    </UFormField>

    <!-- Submit Buttons -->
    <div class="flex justify-end gap-3 pt-6 border-t w-full">
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
        :disabled="!isFormValid"
        color="primary"
      >
        {{ mode === 'add' ? 'Publikasikan' : 'Update Blog' }}
      </UButton>
    </div>
  </UForm>
</template>