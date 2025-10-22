<script setup lang="ts">
import { ref, watch, resolveComponent, computed } from 'vue'

const UForm = resolveComponent('UForm')
const UFormField = resolveComponent('UFormField')
const UInput = resolveComponent('UInput')
const UTextarea = resolveComponent('UTextarea')
const UButton = resolveComponent('UButton')
const UIcon = resolveComponent('UIcon')
const USelectMenu = resolveComponent('USelectMenu')

interface Schedule {
  id?: string
  name: string
  description: string | null
  start_at: string
  end_at: string
  classes?: Array<{
    id: string
    name: string
    image_url: string | null
  }>
}

interface ClassItem {
  id: string
  name: string
  image_url: string | null
  [key: string]: any
}

interface Props {
  mode: 'add' | 'edit'
  schedule?: Schedule | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  saved: []
  close: []
}>()

const toast = useToast()
const loading = ref(false)
const loadingClasses = ref(false)

const form = ref<Schedule>({
  name: '',
  description: null,
  start_at: '',
  end_at: ''
})

const errors = ref<Record<string, string>>({})
const allClasses = ref<ClassItem[]>([])
const selectedClasses = ref<ClassItem[]>([])

// Computed property untuk format USelectMenu
const classOptions = computed(() => {
  return allClasses.value.map(klass => ({
    id: klass.id,
    name: klass.name,
    label: klass.name, // Untuk ditampilkan di dropdown
    value: klass.id     // Untuk value
  }))
})

// Initialize form
watch(() => props.schedule, (schedule) => {
  if (schedule && props.mode === 'edit') {
    form.value = {
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      start_at: new Date(schedule.start_at).toISOString().slice(0, 16),
      end_at: new Date(schedule.end_at).toISOString().slice(0, 16),
      classes: schedule.classes
    }
    // Map schedule classes to selected classes
    if (schedule.classes) {
      selectedClasses.value = schedule.classes.map(klass => ({
        id: klass.id,
        name: klass.name,
        image_url: klass.image_url
      }))
    }
  } else {
    form.value = {
      name: '',
      description: null,
      start_at: '',
      end_at: ''
    }
    selectedClasses.value = []
  }
  errors.value = {}
}, { immediate: true })

// Fetch all classes
async function fetchClasses() {
  try {
    loadingClasses.value = true
    const response = await $fetch('/api/classes', {
      query: {
        limit: 999
      }
    }) as any
    
    if (response.data) {
      allClasses.value = response.data
    }
  } catch (error: any) {
    console.error('Error fetching classes:', error)
    toast.add({
      title: 'Gagal Memuat Data Kelas',
      description: error.data?.statusMessage || 'Terjadi kesalahan saat mengambil data kelas',
      color: 'error'
    })
  } finally {
    loadingClasses.value = false
  }
}

// Fetch classes on mount
onMounted(() => {
  fetchClasses()
})

// Form validation
const isFormValid = computed(() => {
  if (!form.value.name || form.value.name.trim() === '') return false
  if (!form.value.start_at) return false
  if (!form.value.end_at) return false
  
  if (form.value.start_at && form.value.end_at) {
    const startDate = new Date(form.value.start_at)
    const endDate = new Date(form.value.end_at)
    if (startDate >= endDate) return false
  }
  
  return true
})

// Validate form
function validateForm(): boolean {
  errors.value = {}

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Nama jadwal harus diisi'
  }

  if (!form.value.start_at) {
    errors.value.start_at = 'Tanggal mulai harus diisi'
  }

  if (!form.value.end_at) {
    errors.value.end_at = 'Tanggal selesai harus diisi'
  }

  if (form.value.start_at && form.value.end_at) {
    const startDate = new Date(form.value.start_at)
    const endDate = new Date(form.value.end_at)

    if (startDate >= endDate) {
      errors.value.end_at = 'Tanggal selesai harus lebih akhir dari tanggal mulai'
    }
  }

  return Object.keys(errors.value).length === 0
}

// Submit form
async function handleSubmit() {
  if (!validateForm()) {
    toast.add({
      title: 'Validasi Gagal',
      description: 'Silakan periksa kembali form Anda',
      color: 'error'
    })
    return
  }

  try {
    loading.value = true

    const payload = {
      id: form.value.id || undefined,
      name: form.value.name,
      description: form.value.description,
      start_at: new Date(form.value.start_at).toISOString(),
      end_at: new Date(form.value.end_at).toISOString(),
      class_ids: selectedClasses.value.map(c => c.id)
    }

    await $fetch('/api/schedules', {
      method: 'POST',
      body: payload
    })

    toast.add({
      title: props.mode === 'add' ? 'Jadwal Berhasil Dibuat' : 'Jadwal Berhasil Diperbarui',
      color: 'success'
    })

    emit('saved')
  } catch (error: any) {
    console.error('Error:', error)
    toast.add({
      title: 'Gagal',
      description: error.data?.statusMessage || 'Terjadi kesalahan saat menyimpan',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm @submit.prevent="handleSubmit" class="space-y-6 w-full">
    <!-- Nama Jadwal -->
    <UFormField label="Nama Jadwal" name="name" required class="w-full">
      <UInput
        v-model="form.name"
        placeholder="Contoh: Jadwal Semester Ganjil 2024"
        class="w-full"
        :disabled="loading"
        :error="!!errors.name"
      />
      <template #help>
        Berikan nama yang jelas untuk jadwal pembelajaran
      </template>
      <template v-if="errors.name" #error>
        {{ errors.name }}
      </template>
    </UFormField>

    <!-- Deskripsi -->
    <UFormField label="Deskripsi" name="description" class="w-full">
      <UTextarea
        v-model="form.description"
        placeholder="Deskripsi jadwal pembelajaran..."
        :rows="3"
        class="w-full"
        :disabled="loading"
      />
      <template #help>
        Informasi tambahan tentang jadwal (opsional)
      </template>
    </UFormField>

    <!-- Pilih Kelas -->
    <UFormField label="Pilih Kelas" name="classes_id" class="w-full">
      <USelectMenu
        v-model="selectedClasses"
        :items="classOptions"
        searchable
        searchable-placeholder="Cari kelas..."
        placeholder="Pilih kelas yang akan menggunakan jadwal ini"
        :disabled="loading || loadingClasses"
      />
      <template #help>
        Pilih satu atau lebih kelas yang akan menggunakan jadwal ini
      </template>
    </UFormField>

    <!-- Tanggal Mulai -->
    <UFormField label="Tanggal Mulai" name="start_at" required class="w-full">
      <UInput
        v-model="form.start_at"
        type="datetime-local"
        class="w-full"
        :disabled="loading"
        :error="!!errors.start_at"
      />
      <template #help>
        Tanggal dan waktu mulai jadwal
      </template>
      <template v-if="errors.start_at" #error>
        {{ errors.start_at }}
      </template>
    </UFormField>

    <!-- Tanggal Selesai -->
    <UFormField label="Tanggal Selesai" name="end_at" required class="w-full">
      <UInput
        v-model="form.end_at"
        type="datetime-local"
        class="w-full"
        :disabled="loading"
        :error="!!errors.end_at"
      />
      <template #help>
        Tanggal dan waktu selesai jadwal
      </template>
      <template v-if="errors.end_at" #error>
        {{ errors.end_at }}
      </template>
    </UFormField>

    <!-- Classes Info (Edit Mode Only) -->
    <UFormField 
      v-if="mode === 'edit'" 
      label="Kelas yang Terhubung" 
      name="classes" 
      class="w-full"
    >
      <div v-if="form.classes && form.classes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div
          v-for="klass in form.classes"
          :key="klass.id"
          class="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-700/50"
        >
          <div
            v-if="klass.image_url"
            class="w-8 h-8 rounded overflow-hidden flex-shrink-0"
          >
            <img
              :src="klass.image_url"
              :alt="klass.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="w-8 h-8 rounded bg-blue-200 dark:bg-blue-700 flex-shrink-0 flex items-center justify-center">
            <UIcon name="i-lucide-book" class="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ klass.name }}
            </p>
            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">
              {{ klass.id }}
            </p>
          </div>
          <UIcon name="i-lucide-check" class="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        </div>
      </div>

      <!-- No Classes Message -->
      <div v-else class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <UIcon name="i-lucide-book" class="w-6 h-6 text-gray-400 mx-auto mb-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Belum ada kelas yang terhubung dengan jadwal ini
        </p>
      </div>

      <template #help>
        Daftar kelas yang menggunakan jadwal ini
      </template>
    </UFormField>

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
        {{ mode === 'add' ? 'Tambah Jadwal' : 'Simpan Perubahan' }}
      </UButton>
    </div>
  </UForm>
</template>