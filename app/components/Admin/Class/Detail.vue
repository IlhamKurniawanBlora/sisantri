<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCard = resolveComponent('UCard')

const props = defineProps<{
  classItem: {
    id: string
    name: string
    image_url?: string | null
    created_at: string
    updated_at: string
    deleted_at?: string
    schedules?: {
      id: string
      name: string
      description: string
      start_at: string
      end_at: string
    }
  }
}>()

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTime = (timeString: string) => {
  if (!timeString) return '-'
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return timeString
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <UCard>
      <div class="space-y-4">
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white break-words">
              {{ classItem.name }}
            </h3>
            <p v-if="classItem.schedules" class="text-lg text-gray-600 dark:text-gray-400 mt-2">
              Jadwal: {{ classItem.schedules.name }}
            </p>
          </div>
          <UBadge 
            :color="classItem.deleted_at ? 'red' : 'green'" 
            variant="subtle" 
            size="lg"
            class="ml-4 flex-shrink-0"
          >
            {{ classItem.deleted_at ? 'Tidak Aktif' : 'Aktif' }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- Image -->
    <UCard v-if="classItem.image_url">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-image" class="w-5 h-5" />
          <h4 class="font-semibold">Gambar Kelas</h4>
        </div>
      </template>
      <img 
        :src="classItem.image_url" 
        :alt="classItem.name" 
        class="w-full h-auto rounded-lg object-cover"
      />
    </UCard>

    <!-- Schedule Information -->
    <UCard v-if="classItem.schedules">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Jadwal</h4>
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Jadwal</label>
          <p class="mt-1 text-gray-900 dark:text-white font-medium">
            {{ classItem.schedules.name }}
          </p>
        </div>

        <div>
          <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</label>
          <p class="mt-1 text-gray-900 dark:text-white">
            {{ classItem.schedules.description || '-' }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Jam Mulai</label>
            <p class="mt-1 text-gray-900 dark:text-white font-mono">
              {{ formatTime(classItem.schedules.start_at) }}
            </p>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Jam Selesai</label>
            <p class="mt-1 text-gray-900 dark:text-white font-mono">
              {{ formatTime(classItem.schedules.end_at) }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- No Schedule Alert -->
    <UCard v-else>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-calendar-off" class="w-5 h-5" />
          <h4 class="font-semibold">Jadwal</h4>
        </div>
      </template>

      <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
        <div class="flex gap-3">
          <UIcon name="i-lucide-alert-circle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 class="font-medium text-yellow-900 dark:text-yellow-100">Belum Ada Jadwal</h5>
            <p class="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Kelas ini belum memiliki jadwal yang terkait. Silakan edit kelas untuk menambahkan jadwal.
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <!-- System Information -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Sistem</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID Kelas</dt>
          <dd class="mt-1 text-gray-900 dark:text-white font-mono text-sm break-all">
            {{ classItem.id }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dibuat</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(classItem.created_at) }}
          </dd>
        </div>
        
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Diperbarui</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(classItem.updated_at) }}
          </dd>
        </div>
        
        <div v-if="classItem.deleted_at">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dihapus</dt>
          <dd class="mt-1 text-red-600 dark:text-red-400">
            {{ formatDate(classItem.deleted_at) }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd class="mt-1">
            <UBadge 
              :color="classItem.deleted_at ? 'red' : 'green'" 
              variant="subtle"
            >
              {{ classItem.deleted_at ? 'Dihapus' : 'Aktif' }}
            </UBadge>
          </dd>
        </div>
      </div>
    </UCard>
  </div>
</template>
