<script setup lang="ts">
import { reactive, computed, ref, resolveComponent, onBeforeUnmount, watch } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

interface FormState {
  name: string
  image_url: string
  file: File | null
  previewUrl: string | null
}

interface Props {
  mode: 'add' | 'edit'
  classItem?: {
    id?: string
    name: string
    image_url?: string | null
  } | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  saved: [data?: any]
  close: []
}>()

const toast = useToast()
const loading = ref(false)

const formState = reactive<FormState>({
  name: '',
  image_url: '',
  file: null,
  previewUrl: null
})

/**
 * Initialize form with existing data for edit mode
 */
const initializeForm = () => {
  if (props.mode === 'edit' && props.classItem) {
    formState.name = props.classItem.name || ''
    formState.image_url = props.classItem.image_url || ''
    formState.previewUrl = props.classItem.image_url || null
    formState.file = null
  }
}

// Watch for prop changes to re-initialize form
watch(() => props.classItem, () => {
  if (props.mode === 'edit') {
    initializeForm()
  }
}, { deep: true })

// Initialize form on mount
initializeForm()

const isFormValid = computed(() => {
  return formState.name.trim().length > 0
})

/**
 * Handle file input change and validation
 */
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

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

  // Revoke previous blob URL if exists
  if (formState.previewUrl && formState.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(formState.previewUrl)
  }

  formState.file = file
  formState.previewUrl = URL.createObjectURL(file)
}

/**
 * Clear existing image preview
 */
function clearImagePreview() {
  if (formState.previewUrl && formState.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(formState.previewUrl)
  }
  formState.file = null
  formState.previewUrl = null
  formState.image_url = ''
}

/**
 * Handle form submission
 */
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
    formData.append('name', formState.name)

    if (formState.file) {
      formData.append('file', formState.file)
    }
    formData.append('image_url', formState.image_url || '')

    if (props.mode === 'edit' && props.classItem?.id) {
      formData.append('id', props.classItem.id)
    }

    await $fetch('/api/classes', {
      method: 'POST',
      body: formData
    })

    const message = props.mode === 'edit' ? 'Kelas berhasil diperbarui!' : 'Kelas berhasil ditambahkan!'
    toast.add({
      title: message,
      color: 'success'
    })
    emit('saved')
  } catch (error: any) {
    console.error('Form submission error:', error)

    const errorMessage = error?.data?.statusMessage
      || error?.data?.message
      || error?.statusMessage
      || error?.message
      || 'Terjadi kesalahan'

    const action = props.mode === 'edit' ? 'memperbarui' : 'menambahkan'
    toast.add({
      title: `Gagal ${action} kelas`,
      description: errorMessage,
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

/**
 * Cleanup blob URLs on unmount
 */
onBeforeUnmount(() => {
  if (formState.previewUrl && formState.previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(formState.previewUrl)
  }
})

</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6 w-full">
    <!-- Image Upload -->
    <UFormField label="Gambar Kelas" name="image" class="w-full">
      <UInput
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="mb-3 w-full"
        :disabled="loading"
      />

      <!-- Image Preview -->
      <div v-if="formState.previewUrl" class="mt-3 w-full space-y-3">
        <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
          {{ formState.file ? 'Preview Gambar Baru' : 'Gambar Saat Ini' }}
        </p>
        <div class="relative inline-block w-full">
          <img
            :src="formState.previewUrl"
            alt="Preview"
            class="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <UButton
            type="button"
            icon="i-lucide-trash-2"
            color="error"
            variant="soft"
            size="xs"
            class="absolute top-2 right-2"
            @click="clearImagePreview"
            :disabled="loading"
          >
            Hapus
          </UButton>
        </div>
      </div>

      <template #help>
        Ukuran maksimal file: 5MB. Format: JPG, PNG, GIF, WebP
      </template>
    </UFormField>

    <!-- Name -->
    <UFormField label="Nama Kelas" name="name" required class="w-full">
      <UInput
        v-model="formState.name"
        placeholder="Masukkan nama kelas"
        class="w-full"
        :disabled="loading"
      />
      <template #help>
        Contoh: Kelas 1A, Kelas 2 Alif, dll
      </template>
    </UFormField>

    <!-- Form Actions -->
    <div class="flex justify-end gap-3 pt-6 w-full border-t border-gray-200 dark:border-gray-700">
      <UButton
        type="button"
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
        {{ mode === 'add' ? 'Tambah Kelas' : 'Update Kelas' }}
      </UButton>
    </div>
  </UForm>
</template>
