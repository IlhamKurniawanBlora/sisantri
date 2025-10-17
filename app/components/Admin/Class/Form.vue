<script setup lang="ts">
import { reactive, computed, ref, resolveComponent, onBeforeUnmount } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')

const props = defineProps<{
  mode: 'add' | 'edit'
  classItem?: any
}>()

const emit = defineEmits<{
  saved: [data?: any]
  close: []
}>()

const toast = useToast()
const loading = ref(false)

const formState = reactive({
  name: '',
  image_url: '',
  file: null as File | null,
  previewUrl: null as string | null
})

// Initialize form data for edit mode
if (props.mode === 'edit' && props.classItem) {
  Object.assign(formState, {
    name: props.classItem.name || '',
    image_url: props.classItem.image_url || '',
    previewUrl: props.classItem.image_url || null
  })
}



const isFormValid = computed(() => {
  return formState.name.trim().length > 0
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

    const response = await $fetch('/api/classes', {
      method: 'POST',
      body: formData
    })

    toast.add({
      title: props.mode === 'edit' ? 'Kelas berhasil diperbarui!' : 'Kelas berhasil ditambahkan!',
      color: 'success'
    })
    emit('saved')
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
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} kelas`,
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
    <UFormField label="Gambar Kelas" name="image" class="w-full">
      <UInput 
        type="file" 
        accept="image/*" 
        @change="handleFileChange"
        class="mb-3 w-full"
        :disabled="loading"
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
        {{ mode === 'add' ? 'Tambah Kelas' : 'Update Kelas' }}
      </UButton>
    </div>
  </UForm>
</template>
