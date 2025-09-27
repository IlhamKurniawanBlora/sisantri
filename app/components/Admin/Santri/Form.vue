<script setup lang="ts">
import { reactive, computed, ref, resolveComponent } from 'vue'

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

// --- Form state ---
const formState = reactive({
  nis: '',
  full_name: '',
  gender: 'male',
  address: '',
  file: null as File | null,
  previewUrl: null as string | null
})

// --- Prefill kalau edit ---
if (props.mode === 'edit' && props.santri) {
  Object.assign(formState, {
    nis: props.santri.nis || '',
    full_name: props.santri.full_name || '',
    gender: props.santri.gender || 'male',
    address: props.santri.address || '',
    previewUrl: props.santri.image_url || null
  })
}

const genderOptions = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

const isFormValid = computed(() => {
  return !!(formState.nis && formState.full_name && formState.gender && formState.address)
})

// --- File handler ---
function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    formState.file = target.files[0]
    formState.previewUrl = URL.createObjectURL(target.files[0])
  }
}

function clearImage() {
  formState.file = null
  formState.previewUrl = null
}

// --- Submit handler ---
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

    // Tambahkan ID kalau edit
    if (props.mode === 'edit' && props.santri?.id) {
      formData.append('id', props.santri.id)
    }

    formData.append('nis', formState.nis)
    formData.append('full_name', formState.full_name)
    formData.append('gender', formState.gender)
    formData.append('address', formState.address)

    if (formState.file) {
      formData.append('file', formState.file)
    }

    await $fetch('/api/santris', {
      method: 'POST',
      body: formData
    })

    toast.add({
      title: props.mode === 'edit'
        ? 'Santri berhasil diperbarui!'
        : 'Santri berhasil ditambahkan!',
      color: 'success'
    })

    emit('saved')

    // Reset kalau tambah baru
    if (props.mode === 'add') {
      Object.assign(formState, {
        nis: '',
        full_name: '',
        gender: 'male',
        address: '',
        file: null,
        previewUrl: null
      })
    }
  } catch (error: any) {
    toast.add({
      title: `Gagal ${props.mode === 'edit' ? 'memperbarui' : 'menambahkan'} santri`,
      description: error?.data?.statusMessage || error?.message || 'Terjadi kesalahan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Foto -->
    <UFormField label="Foto Santri" name="photo">
      <UInput
        type="file"
        accept="image/*"
        @change="handleFileChange"
        class="mb-3 w-full"
      />

      <div v-if="formState.previewUrl" class="mt-3 relative w-fit">
        <img
          :src="formState.previewUrl"
          alt="Preview"
          class="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
        />
        <UButton
          size="xs"
          color="error"
          variant="soft"
          class="absolute top-1 right-1"
          @click="clearImage"
        >
          Hapus
        </UButton>
      </div>
    </UFormField>

    <!-- NIS -->
    <UFormField label="NIS" name="nis" required>
      <UInput
        v-model="formState.nis"
        placeholder="Masukkan NIS"
        :disabled="mode === 'edit'"
        class="w-full"
      />
    </UFormField>

    <!-- Nama -->
    <UFormField label="Nama Lengkap" name="full_name" required>
      <UInput
        v-model="formState.full_name"
        placeholder="Masukkan nama lengkap"
        class="w-full"
      />
    </UFormField>

    <!-- Gender -->
    <UFormField label="Gender" name="gender" required>
      <USelect
        v-model="formState.gender"
        :items="genderOptions"
        placeholder="Pilih gender"
        class="w-full"
      />
    </UFormField>

    <!-- Alamat -->
    <UFormField label="Alamat" name="address" required>
      <UTextarea
        v-model="formState.address"
        placeholder="Masukkan alamat lengkap"
        rows="3"
        class="w-full"
      />
    </UFormField>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-6">
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
