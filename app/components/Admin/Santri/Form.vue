<script setup lang="ts">
import { reactive, computed, resolveComponent } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UTextarea = resolveComponent('UTextarea')
const UButton = resolveComponent('UButton')

const props = defineProps<{
  mode: 'add' | 'edit'
  santri?: any
}>()

const emit = defineEmits<{
  saved: []
  close: []
}>()

const toast = useToast()
const loading = ref(false)

// Form state
const formState = reactive({
  nis: '',
  full_name: '',
  gender: 'male',
  birth_date: '',
  birth_place: '',
  address: '',
  phone: '',
  parent_name: '',
  parent_phone: '',
  class_level: '',
  status: 'active',
  file: null as File | null,
  previewUrl: null as string | null
})

// Initialize form with santri data if editing
if (props.mode === 'edit' && props.santri) {
  Object.assign(formState, {
    nis: props.santri.nis || '',
    full_name: props.santri.full_name || '',
    gender: props.santri.gender || 'male',
    birth_date: props.santri.birth_date || '',
    birth_place: props.santri.birth_place || '',
    address: props.santri.address || '',
    phone: props.santri.phone || '',
    parent_name: props.santri.parent_name || '',
    parent_phone: props.santri.parent_phone || '',
    class_level: props.santri.class_level || '',
    status: props.santri.status || 'active',
    previewUrl: props.santri.image_url || null
  })
}

// Options
const genderOptions = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

const statusOptions = [
  { label: 'Aktif', value: 'active' },
  { label: 'Tidak Aktif', value: 'inactive' },
  { label: 'Lulus', value: 'graduated' },
  { label: 'Keluar', value: 'dropped_out' }
]

const classLevelOptions = [
  { label: 'Kelas 1', value: '1' },
  { label: 'Kelas 2', value: '2' },
  { label: 'Kelas 3', value: '3' },
  { label: 'Kelas 4', value: '4' },
  { label: 'Kelas 5', value: '5' },
  { label: 'Kelas 6', value: '6' }
]

// Form validation
const isFormValid = computed(() => {
  return formState.nis && formState.full_name && formState.gender && formState.address
})

// Handle file change
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formState.file = target.files[0]
    formState.previewUrl = URL.createObjectURL(target.files[0])
  }
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
      if (key !== 'file' && key !== 'previewUrl' && value !== null && value !== '') {
        formData.append(key, value)
      }
    })
    
    // Append file if present
    if (formState.file) {
      formData.append('file', formState.file)
    }

    const url = props.mode === 'edit' ? `/api/santris/${props.santri.id}` : '/api/santris'
    const method = props.mode === 'edit' ? 'PUT' : 'POST'
    
    await $fetch(url, {
      method,
      body: formData
    })

    toast.add({
      title: props.mode === 'edit' ? 'Santri berhasil diperbarui!' : 'Santri berhasil ditambahkan!',
      color: 'success'
    })

    emit('saved')
  } catch (error: any) {
    toast.add({
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} santri`,
      description: error?.data?.message || error.message || 'Terjadi kesalahan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Photo Upload -->
    <UFormField label="Foto Santri" name="photo">
      <UInput 
        type="file" 
        accept="image/*" 
        @change="handleFileChange"
        class="mb-3"
      />
      <div v-if="formState.previewUrl" class="mt-3">
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
        <img 
          :src="formState.previewUrl" 
          alt="Preview"
          class="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>
    </UFormField>

    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="NIS" name="nis" required>
        <UInput 
          v-model="formState.nis" 
          placeholder="Masukkan NIS"
          :disabled="mode === 'edit'"
        />
      </UFormField>

      <UFormField label="Nama Lengkap" name="full_name" required>
        <UInput 
          v-model="formState.full_name" 
          placeholder="Masukkan nama lengkap"
        />
      </UFormField>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Gender" name="gender" required>
        <USelect 
          v-model="formState.gender" 
          :options="genderOptions"
          placeholder="Pilih gender"
        />
      </UFormField>

      <UFormField label="Status" name="status">
        <USelect 
          v-model="formState.status" 
          :options="statusOptions"
          placeholder="Pilih status"
        />
      </UFormField>
    </div>

    <!-- Birth Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="Tanggal Lahir" name="birth_date">
        <UInput 
          v-model="formState.birth_date" 
          type="date"
          placeholder="Pilih tanggal lahir"
        />
      </UFormField>

      <UFormField label="Tempat Lahir" name="birth_place">
        <UInput 
          v-model="formState.birth_place" 
          placeholder="Masukkan tempat lahir"
        />
      </UFormField>
    </div>

    <!-- Contact Information -->
    <UFormField label="Alamat" name="address" required>
      <UTextarea 
        v-model="formState.address" 
        placeholder="Masukkan alamat lengkap"
        rows="3"
      />
    </UFormField>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UFormField label="No. Telepon" name="phone">
        <UInput 
          v-model="formState.phone" 
          placeholder="Masukkan no. telepon"
          type="tel"
        />
      </UFormField>

      <UFormField label="Tingkat Kelas" name="class_level">
        <USelect 
          v-model="formState.class_level" 
          :options="classLevelOptions"
          placeholder="Pilih tingkat kelas"
        />
      </UFormField>
    </div>

    <!-- Parent Information -->
    <div class="border-t pt-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Informasi Orang Tua/Wali
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UFormField label="Nama Orang Tua/Wali" name="parent_name">
          <UInput 
            v-model="formState.parent_name" 
            placeholder="Masukkan nama orang tua/wali"
          />
        </UFormField>

        <UFormField label="No. Telepon Orang Tua" name="parent_phone">
          <UInput 
            v-model="formState.parent_phone" 
            placeholder="Masukkan no. telepon orang tua"
            type="tel"
          />
        </UFormField>
      </div>
    </div>

    <!-- Submit Buttons -->
    <div class="flex justify-end gap-3 pt-6 border-t">
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
        {{ mode === 'add' ? 'Simpan' : 'Update' }}
      </UButton>
    </div>
  </UForm>
</template>