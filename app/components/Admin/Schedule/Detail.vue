<script setup lang="ts">
interface Schedule {
  id: string
  name: string
  description: string | null
  start_at: string
  end_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  classes: Array<{
    id: string
    name: string
    image_url: string | null
  }>
}

interface Props {
  schedule: Schedule
}

defineProps<Props>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function calculateDuration(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} hari ${hours} jam`
  return `${hours} jam`
}
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Main Info -->
    <div>
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Informasi Jadwal
      </h3>
      <div class="space-y-4">
        <!-- Nama -->
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Nama Jadwal</p>
          <p class="text-lg font-semibold text-gray-900 dark:text-white">{{ schedule.name }}</p>
        </div>

        <!-- Deskripsi -->
        <div v-if="schedule.description">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Deskripsi</p>
          <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ schedule.description }}</p>
        </div>

        <!-- Status -->
        <div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
          <UBadge 
            :color="schedule.deleted_at ? 'error' : 'success'"
            :variant="schedule.deleted_at ? 'soft' : 'subtle'"
          >
            {{ schedule.deleted_at ? 'Tidak Aktif' : 'Aktif' }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Timeline Info -->
    <div>
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Waktu Jadwal
      </h3>
      <div class="space-y-4">
        <!-- Mulai -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <UIcon name="i-lucide-calendar-check" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Tanggal Mulai</p>
            <p class="text-gray-900 dark:text-white font-medium mt-0.5">
              {{ formatDate(schedule.start_at) }}
            </p>
          </div>
        </div>

        <!-- Selesai -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30">
              <UIcon name="i-lucide-calendar-x" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Tanggal Selesai</p>
            <p class="text-gray-900 dark:text-white font-medium mt-0.5">
              {{ formatDate(schedule.end_at) }}
            </p>
          </div>
        </div>

        <!-- Durasi -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30">
              <UIcon name="i-lucide-clock" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">Durasi</p>
            <p class="text-gray-900 dark:text-white font-medium mt-0.5">
              {{ calculateDuration(schedule.start_at, schedule.end_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Classes Section -->
    <div>
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Kelas Terkait ({{ schedule.classes?.length || 0 }})
      </h3>
      
      <div v-if="schedule.classes && schedule.classes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="klass in schedule.classes"
          :key="klass.id"
          class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div 
            v-if="klass.image_url"
            class="w-10 h-10 rounded flex-shrink-0 overflow-hidden"
          >
            <img 
              :src="klass.image_url" 
              :alt="klass.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div v-else class="w-10 h-10 rounded bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
            <UIcon name="i-lucide-book" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-900 dark:text-white truncate">{{ klass.name }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ klass.id }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <UIcon name="i-lucide-book" class="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Belum ada kelas yang terhubung dengan jadwal ini
        </p>
      </div>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 dark:border-gray-700" />

    <!-- Metadata -->
    <div>
      <h3 class="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Informasi Sistem
      </h3>
      <div class="space-y-3 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Dibuat pada</span>
          <span class="text-gray-900 dark:text-white font-medium">
            {{ formatDate(schedule.created_at) }}
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Diperbarui</span>
          <span class="text-gray-900 dark:text-white font-medium">
            {{ formatDate(schedule.updated_at) }}
          </span>
        </div>
        <div v-if="schedule.deleted_at" class="flex justify-between">
          <span class="text-gray-600 dark:text-gray-400">Dihapus</span>
          <span class="text-red-600 dark:text-red-400 font-medium">
            {{ formatDate(schedule.deleted_at) }}
          </span>
        </div>
        <div class="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span class="text-gray-600 dark:text-gray-400">ID</span>
          <code class="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
            {{ schedule.id }}
          </code>
        </div>
      </div>
    </div>
  </div>
</template>
