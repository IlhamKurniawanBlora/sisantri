<script setup lang="ts">
import { ref, watch } from 'vue'

interface Schedule {
  id?: string
  name: string
  description: string | null
  start_at: string
  end_at: string
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

const form = ref<Schedule>({
  name: '',
  description: null,
  start_at: '',
  end_at: ''
})

const errors = ref<Record<string, string>>({})

// Initialize form
watch(() => props.schedule, (schedule) => {
  if (schedule && props.mode === 'edit') {
    form.value = {
      id: schedule.id,
      name: schedule.name,
      description: schedule.description,
      start_at: new Date(schedule.start_at).toISOString().slice(0, 16),
      end_at: new Date(schedule.end_at).toISOString().slice(0, 16)
    }
  } else {
    form.value = {
      name: '',
      description: null,
      start_at: '',
      end_at: ''
    }
  }
  errors.value = {}
}, { immediate: true })

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
async function submitForm() {
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
      end_at: new Date(form.value.end_at).toISOString()
    }

    const response = await $fetch('/api/schedules', {
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
  <div class="p-4 space-y-4">
    <!-- Nama Jadwal -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Nama Jadwal
      </label>
      <UInput
        v-model="form.name"
        placeholder="Contoh: Jadwal Semester Ganjil 2024"
        :error="!!errors.name"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
    </div>

    <!-- Deskripsi -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Deskripsi (Opsional)
      </label>
      <UTextarea
        v-model="form.description"
        placeholder="Deskripsi jadwal pembelajaran..."
        :rows="3"
      />
    </div>

    <!-- Tanggal Mulai -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tanggal Mulai
      </label>
      <UInput
        v-model="form.start_at"
        type="datetime-local"
        :error="!!errors.start_at"
      />
      <p v-if="errors.start_at" class="mt-1 text-xs text-red-500">{{ errors.start_at }}</p>
    </div>

    <!-- Tanggal Selesai -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Tanggal Selesai
      </label>
      <UInput
        v-model="form.end_at"
        type="datetime-local"
        :error="!!errors.end_at"
      />
      <p v-if="errors.end_at" class="mt-1 text-xs text-red-500">{{ errors.end_at }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
      <UButton
        @click="submitForm"
        :loading="loading"
        class="flex-1"
      >
        {{ mode === 'add' ? 'Tambah Jadwal' : 'Simpan Perubahan' }}
      </UButton>
      <UButton
        @click="emit('close')"
        variant="outline"
        class="flex-1"
      >
        Batal
      </UButton>
    </div>
  </div>
</template>
