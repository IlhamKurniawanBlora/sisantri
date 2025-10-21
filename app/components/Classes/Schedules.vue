<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Schedule {
  id: string
  name: string
  description?: string
  start_at: string
  end_at: string
  classes: {
    id: string
    name: string
    image_url?: string
  }
  created_at?: string
  updated_at?: string
}

interface Class {
  id: string
  name: string
  image_url?: string
  description?: string
  created_at?: string
  updated_at?: string
}

interface ClassWithSchedules extends Class {
  schedules: Schedule[]
}

const props = withDefaults(defineProps<{
  limit?: number
  search?: string
}>(), {
  limit: 12,
  search: ''
})

const loading = ref(false)
const error = ref<string | null>(null)
const classesData = ref<ClassWithSchedules[]>([])
const selectedClass = ref<ClassWithSchedules | null>(null)
const showDetailModal = ref(false)

// Fetch classes with their schedules
async function fetchClassesWithSchedules() {
  loading.value = true
  error.value = null

  try {
    // Fetch all classes
    const classesResponse = await $fetch<any>('/api/classes', {
      query: {
        limit: props.limit,
        search: props.search,
        sortBy: 'name_asc'
      }
    })

    if (!classesResponse.success || !classesResponse.data) {
      throw new Error('Gagal mengambil data kelas')
    }

    // Fetch all schedules
    const schedulesResponse = await $fetch<any>('/api/schedules', {
      query: {
        limit: 100,
        sortBy: 'start_time'
      }
    })

    if (!schedulesResponse.success || !schedulesResponse.data) {
      throw new Error('Gagal mengambil data jadwal')
    }

    // Group schedules by class
    const schedulesByClass = new Map<string, Schedule[]>()
    schedulesResponse.data.forEach((schedule: Schedule) => {
      const classId = schedule.classes?.id
      if (classId) {
        if (!schedulesByClass.has(classId)) {
          schedulesByClass.set(classId, [])
        }
        schedulesByClass.get(classId)!.push(schedule)
      }
    })

    // Combine classes with their schedules
    classesData.value = classesResponse.data.map((classItem: Class) => ({
      ...classItem,
      schedules: schedulesByClass.get(classItem.id) || []
    }))
  } catch (err: any) {
    error.value = err?.message || 'Terjadi kesalahan saat mengambil data'
    console.error('Error fetching classes and schedules:', err)
  } finally {
    loading.value = false
  }
}

// Format time from ISO string
function formatTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return dateString
  }
}

// Format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateString
  }
}

// Time range for schedule
function getTimeRange(startAt: string, endAt: string): string {
  return `${formatTime(startAt)} - ${formatTime(endAt)}`
}

// Open detail modal
function openDetailModal(classItem: ClassWithSchedules) {
  selectedClass.value = classItem
  showDetailModal.value = true
}

// Close detail modal
function closeDetailModal() {
  showDetailModal.value = false
  selectedClass.value = null
}

onMounted(() => {
  fetchClassesWithSchedules()
})

// Re-fetch when props change
watch(() => [props.limit, props.search], () => {
  fetchClassesWithSchedules()
}, { immediate: false })
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <USkeleton class="h-64 w-full" :ui="{ rounded: 'rounded-lg' }" />
    </div>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      color="error"
      title="Terjadi Kesalahan"
      :description="error"
      class="mb-4"
    >
      <template #icon>
        <UIcon name="i-heroicons-exclamation-circle" class="w-5 h-5" />
      </template>
    </UAlert>

    <!-- Empty State -->
    <div v-else-if="classesData.length === 0" class="text-center py-12">
      <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p class="text-gray-500 dark:text-gray-400">Tidak ada data kelas yang tersedia</p>
    </div>

    <!-- Classes Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="classItem in classesData"
        :key="classItem.id"
        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <!-- Class Header with Image -->
        <div class="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden">
          <img
            v-if="classItem.image_url"
            :src="classItem.image_url"
            :alt="classItem.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-book-open" class="w-16 h-16 text-blue-200 opacity-50" />
          </div>

          <!-- Class Name Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
            <h3 class="text-xl font-bold text-white">
              {{ classItem.name }}
            </h3>
          </div>
        </div>

        <!-- Class Description -->
        <div v-if="classItem.description" class="px-4 pt-4 pb-2">
          <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {{ classItem.description }}
          </p>
        </div>

        <!-- Schedules Section -->
        <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            <UIcon name="i-heroicons-clock" class="w-4 h-4 inline mr-2" />
            Jadwal ({{ classItem.schedules.length }})
          </h4>

          <!-- Schedules List -->
          <div
            v-if="classItem.schedules.length > 0"
            class="space-y-2 max-h-48 overflow-y-auto"
          >
            <div
              v-for="schedule in classItem.schedules"
              :key="schedule.id"
              class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ schedule.name }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3 inline mr-1" />
                {{ formatDate(schedule.start_at) }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                <UIcon name="i-heroicons-clock" class="w-3 h-3 inline mr-1" />
                {{ getTimeRange(schedule.start_at, schedule.end_at) }}
              </p>
              <p
                v-if="schedule.description"
                class="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2"
              >
                {{ schedule.description }}
              </p>
            </div>
          </div>

          <!-- No Schedules Message -->
          <div v-else class="text-center py-4">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tidak ada jadwal untuk kelas ini
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <UButton
            @click="openDetailModal(classItem)"
            variant="outline"
            size="sm"
            class="flex-1"
          >
            <UIcon name="i-heroicons-eye" class="w-4 h-4" />
            Lihat Detail
          </UButton>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <UModal v-model:open="showDetailModal" class="w-full max-w-4xl">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-book-open" class="w-6 h-6 text-primary" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Kelas
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Informasi lengkap kelas dan jadwalnya
            </p>
          </div>
        </div>
      </template>

      <template #body v-if="selectedClass">
        <div class="space-y-6">
          <!-- Class Image -->
          <div v-if="selectedClass.image_url" class="rounded-lg overflow-hidden">
            <img
              :src="selectedClass.image_url"
              :alt="selectedClass.name"
              class="w-full h-64 object-cover"
            />
          </div>

          <!-- Class Name & Description -->
          <div>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {{ selectedClass.name }}
            </h3>
            <p v-if="selectedClass.description" class="text-gray-600 dark:text-gray-300">
              {{ selectedClass.description }}
            </p>
          </div>

          <!-- Schedules Section -->
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <UIcon name="i-heroicons-clock" class="w-5 h-5 mr-2" />
              Jadwal Kelas ({{ selectedClass.schedules.length }})
            </h3>

            <div v-if="selectedClass.schedules.length > 0" class="space-y-3">
              <div
                v-for="schedule in selectedClass.schedules"
                :key="schedule.id"
                class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div class="flex items-start justify-between mb-3">
                  <h4 class="font-semibold text-gray-900 dark:text-white">
                    {{ schedule.name }}
                  </h4>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600 dark:text-gray-400 flex items-center">
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4 mr-2" />
                      Tanggal
                    </p>
                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                      {{ formatDate(schedule.start_at) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-600 dark:text-gray-400 flex items-center">
                      <UIcon name="i-heroicons-clock" class="w-4 h-4 mr-2" />
                      Waktu
                    </p>
                    <p class="font-medium text-gray-900 dark:text-white mt-1">
                      {{ getTimeRange(schedule.start_at, schedule.end_at) }}
                    </p>
                  </div>
                </div>

                <div v-if="schedule.description" class="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                  <p class="text-sm text-gray-600 dark:text-gray-300">
                    {{ schedule.description }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8">
              <UIcon name="i-heroicons-calendar" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500 dark:text-gray-400">
                Tidak ada jadwal untuk kelas ini
              </p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton
            @click="showDetailModal = false"
            variant="outline"
          >
            Tutup
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style scoped>
/* Custom scrollbar untuk schedule list */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(75, 85, 99, 0.7);
}
</style>
