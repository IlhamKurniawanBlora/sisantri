<script setup lang="ts">
import { computed, resolveComponent } from 'vue'

const UIcon = resolveComponent('UIcon')
const UBadge = resolveComponent('UBadge')
const UCard = resolveComponent('UCard')

interface ClassItem {
  id: string
  name: string
  description?: string | null
  image_url?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

const props = defineProps<{
  classItem: ClassItem
}>()

/**
 * Format date to Indonesian locale
 */
const formatDate = (dateString: string): string => {
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

/**
 * Get status badge color
 */
const getStatusColor = computed(() => {
  return props.classItem.deleted_at ? 'red' : 'green'
})

/**
 * Get status text
 */
const getStatusText = computed(() => {
  return props.classItem.deleted_at ? 'Dihapus' : 'Aktif'
})

</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-book" class="w-5 h-5" />
          <h4 class="font-semibold">Detail Kelas</h4>
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Kelas</dt>
          <dd class="mt-1 text-gray-900 dark:text-white font-semibold text-lg">
            {{ classItem.name }}
          </dd>
        </div>

        <div v-if="classItem.description">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Deskripsi</dt>
          <dd class="mt-1 text-gray-900 dark:text-white whitespace-pre-line">
            {{ classItem.description }}
          </dd>
        </div>
      </div>
    </UCard>

    <!-- Image Section -->
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

    <!-- System Information Section -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-info" class="w-5 h-5" />
          <h4 class="font-semibold">Informasi Sistem</h4>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Class ID -->
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">ID Kelas</dt>
          <dd class="mt-1 text-gray-900 dark:text-white font-mono text-sm break-all">
            {{ classItem.id }}
          </dd>
        </div>

        <!-- Created Date -->
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dibuat</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(classItem.created_at) }}
          </dd>
        </div>

        <!-- Updated Date -->
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Terakhir Diperbarui</dt>
          <dd class="mt-1 text-gray-900 dark:text-white">
            {{ formatDate(classItem.updated_at) }}
          </dd>
        </div>

        <!-- Deleted Date -->
        <div v-if="classItem.deleted_at">
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal Dihapus</dt>
          <dd class="mt-1 text-red-600 dark:text-red-400">
            {{ formatDate(classItem.deleted_at) }}
          </dd>
        </div>

        <!-- Status -->
        <div>
          <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
          <dd class="mt-1">
            <UBadge
              :color="getStatusColor"
              variant="subtle"
            >
              {{ getStatusText }}
            </UBadge>
          </dd>
        </div>
      </div>
    </UCard>
  </div>
</template>
