<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

type ClassItem = {
  id: string
  name: string
  description?: string
}

interface Props {
  open: boolean
  santriId: string
  santriName: string
}

const props = withDefaults(defineProps<Props>(), {
  open: false
})

const emit = defineEmits<{
  close: []
  selected: [classId: string, className: string]
}>()

const classes = ref<ClassItem[]>([])
const selectedClassId = ref<string>('')
const loading = ref(false)
const submitting = ref(false)
const toast = useToast()

// Fetch classes
async function fetchClasses() {
  loading.value = true
  try {
    const response = await $fetch('/api/classes', {
      query: {
        limit: 100,
        sortBy: 'name_asc'
      }
    })
    classes.value = response.data || []
  } catch (error) {
    console.error('Error fetching classes:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data kelas',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// Handle submit
async function handleSubmit() {
  if (!selectedClassId.value) {
    toast.add({
      title: 'Error',
      description: 'Silakan pilih kelas terlebih dahulu',
      color: 'yellow'
    })
    return
  }

  submitting.value = true
  try {
    const selectedClass = classes.value.find(c => c.id === selectedClassId.value)
    
    await $fetch(`/api/santris/${props.santriId}/assign-class`, {
      method: 'PUT',
      body: {
        classes_id: selectedClassId.value
      }
    })

    toast.add({
      title: 'Berhasil',
      description: `${props.santriName} berhasil ditambahkan ke kelas ${selectedClass?.name}`,
      color: 'green'
    })

    emit('selected', selectedClassId.value, selectedClass?.name || '')
    emit('close')
  } catch (error: any) {
    console.error('Error assigning class:', error)
    const errorMessage = error?.data?.statusMessage || error?.message || 'Gagal mengubah kelas'
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'red'
    })
  } finally {
    submitting.value = false
  }
}

// Watch open prop to fetch classes when modal opens
watch(() => props.open, (newVal) => {
  if (newVal) {
    selectedClassId.value = ''
    fetchClasses()
  }
})

onMounted(() => {
  if (props.open) {
    fetchClasses()
  }
})
</script>

<template>
  <UModal :open="open" @update:open="$emit('close')" class="w-full max-w-2xl">
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-book" class="w-6 h-6 text-primary" />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Pilih Kelas untuk {{ santriName }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tentukan kelas mana yang akan ditambahkan santri ini
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        <!-- Empty State -->
        <div v-else-if="classes.length === 0" class="text-center py-8">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p class="text-gray-600 dark:text-gray-300">Tidak ada kelas yang tersedia</p>
        </div>

        <!-- Classes List -->
        <div v-else class="space-y-2">
          <label v-for="classItem in classes" :key="classItem.id" class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <input
              type="radio"
              :value="classItem.id"
              v-model="selectedClassId"
              class="w-4 h-4"
            />
            <div class="ml-3 flex-1">
              <p class="font-semibold text-gray-900 dark:text-white">
                {{ classItem.name }}
              </p>
              <p v-if="classItem.description" class="text-sm text-gray-500 dark:text-gray-400">
                {{ classItem.description }}
              </p>
            </div>
          </label>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          variant="outline"
          @click="$emit('close')"
          :disabled="submitting"
        >
          Batal
        </UButton>
        <UButton
          @click="handleSubmit"
          :loading="submitting"
          :disabled="!selectedClassId || submitting"
        >
          <UIcon name="i-lucide-check" class="mr-2" />
          Pilih Kelas
        </UButton>
      </div>
    </template>
  </UModal>
</template>
