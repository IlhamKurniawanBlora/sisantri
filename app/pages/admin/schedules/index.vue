<script setup lang="ts">
import { ref, h, resolveComponent } from 'vue'

const UButton = resolveComponent('UButton')
const UCard = resolveComponent('UCard')
const UBadge = resolveComponent('UBadge')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UCheckbox = resolveComponent('UCheckbox')
const UIcon = resolveComponent('UIcon')
const USlideover = resolveComponent('USlideover')
const UModal = resolveComponent('UModal')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const toast = useToast()

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

// State management
const schedules = ref<Schedule[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const sortBy = ref('newest')
const includeDeleted = ref(false)
const total = ref(0)

// Modal states
const showSlideover = ref(false)
const mode = ref<'add' | 'edit'>('add')
const selectedSchedule = ref<Schedule | null>(null)
const showDetailModal = ref(false)

// Confirm dialog state
const showConfirmDialog = ref(false)
const confirmOptions = ref<{
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action?: () => Promise<void>
}>()

// Stats
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  withClasses: 0,
  upcoming: 0,
})

// Open confirm dialog
function openConfirmDialog(opts: {
  title: string
  description: string
  variant?: 'destructive' | 'default'
  action: () => Promise<void>
}) {
  confirmOptions.value = opts
  showConfirmDialog.value = true
}

// Delete Schedule
function requestDeleteSchedule(schedule: Schedule) {
  openConfirmDialog({
    title: 'Hapus Jadwal',
    description: `Apakah Anda yakin ingin menghapus jadwal "${schedule.name}"?`,
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/schedules/${schedule.id}/delete`, { method: 'DELETE' })
        toast.add({ 
          title: 'Jadwal berhasil dihapus!', 
          color: 'success', 
          icon: 'i-lucide-trash' 
        })
        fetchSchedules()
      } catch (error) {
        toast.add({ 
          title: 'Gagal menghapus jadwal', 
          color: 'error' 
        })
      }
    }
  })
}

// Delete Permanent
function requestDeletePermanentSchedule(schedule: Schedule) {
  openConfirmDialog({
    title: 'Hapus Permanen Jadwal',
    description: `Apakah Anda yakin ingin menghapus permanen jadwal "${schedule.name}"?`,
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/schedules/${schedule.id}/delete-permanent`, { method: 'DELETE' })
        toast.add({ 
          title: 'Jadwal berhasil dihapus permanen!', 
          color: 'success', 
          icon: 'i-lucide-trash' 
        })
        fetchSchedules()
      } catch (error) {
        toast.add({ 
          title: 'Gagal menghapus jadwal', 
          color: 'error' 
        })
      }
    }
  })
}

// Restore Schedule
function requestRestoreSchedule(schedule: Schedule) {
  openConfirmDialog({
    title: 'Pulihkan Jadwal',
    description: `Apakah Anda yakin ingin memulihkan jadwal "${schedule.name}"?`,
    variant: 'default',
    action: async () => {
      try {
        await $fetch(`/api/schedules/${schedule.id}/restore`, { method: 'DELETE' })
        toast.add({ 
          title: 'Jadwal berhasil dipulihkan!', 
          color: 'success', 
          icon: 'i-lucide-undo-2' 
        })
        fetchSchedules()
      } catch (error) {
        toast.add({ 
          title: 'Gagal memulihkan jadwal', 
          color: 'error' 
        })
      }
    }
  })
}

// Format date
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch schedules
async function fetchSchedules() {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
      sortBy: sortBy.value,
      includeDeleted: includeDeleted.value.toString(),
    })
    
    if (search.value) params.append('search', search.value)

    const response = await $fetch(`/api/schedules?${params.toString()}`)
    schedules.value = response.data || []
    total.value = response.pagination?.total || 0

    await fetchStats()
  } catch (error) {
    console.error('Gagal memuat jadwal:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data jadwal',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Fetch stats
async function fetchStats() {
  try {
    const response = await $fetch('/api/schedules/stats')
    stats.value = {
      total: response.total || 0,
      active: response.active || 0,
      inactive: response.inactive || 0,
      withClasses: response.withClasses || 0,
      upcoming: response.upcoming || 0,
    }
  } catch (error) {
    console.error('Gagal memuat statistik:', error)
  }
}

// Sort options
const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Nama A-Z', value: 'name_asc' },
  { label: 'Nama Z-A', value: 'name_desc' },
  { label: 'Tanggal Mulai', value: 'start_date' }
]

// Clear filters
const clearFilters = () => {
  search.value = ''
  sortBy.value = 'newest'
  includeDeleted.value = false
  page.value = 1
}

// Handle form save
const handleScheduleSaved = () => {
  showSlideover.value = false
  fetchSchedules()
  toast.add({
    title: mode.value === 'add' ? 'Jadwal berhasil dibuat!' : 'Jadwal berhasil diperbarui!',
    color: 'success'
  })
}

// Get row items for dropdown
function getRowItems(schedule: Schedule) {
  const items = [
    { type: 'label', label: 'Actions' },
    {
      label: 'Detail',
      icon: 'i-lucide-eye',
      onSelect() {
        selectedSchedule.value = schedule
        showDetailModal.value = true
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        mode.value = 'edit'
        selectedSchedule.value = schedule
        showSlideover.value = true
      }
    }
  ]

  if (!schedule.deleted_at) {
    items.push({
      label: 'Hapus',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeleteSchedule(schedule)
    })
  } else {
    items.push({
      label: 'Pulihkan',
      icon: 'i-lucide-undo-2',
      onSelect: () => requestRestoreSchedule(schedule)
    }, {
      label: 'Hapus Permanen',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeletePermanentSchedule(schedule)
    })
  }

  return items
}

onMounted(async () => {
  await fetchSchedules()
})

watch([search, sortBy, includeDeleted], () => {
  page.value = 1
  fetchSchedules()
})

watch(page, () => {
  fetchSchedules()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-calendar-days" class="w-6 h-6" />
          Kelola Jadwal
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola jadwal pembelajaran kelas
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        @click="() => { mode = 'add'; selectedSchedule = null; showSlideover = true }"
      >
        Tambah Jadwal
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <!-- Total -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-calendar-days" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jadwal</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </UCard>

      <!-- Aktif -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.active }}</p>
          </div>
        </div>
      </UCard>

      <!-- Tidak Aktif -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-x-circle" class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tidak Aktif</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.inactive }}</p>
          </div>
        </div>
      </UCard>

      <!-- Dengan Kelas -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-book" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Dengan Kelas</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.withClasses }}</p>
          </div>
        </div>
      </UCard>

      <!-- Akan Datang -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-arrow-right" class="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Akan Datang</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.upcoming }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Filters -->
    <UCard class="mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Cari nama atau deskripsi jadwal..."
            :trailing="search ? true : false"
            :loading="loading"
          >
            <template v-if="search" #trailing>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="link"
                size="xs"
                @click="search = ''"
              />
            </template>
          </UInput>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-2">
          <USelect
            v-model="sortBy"
            :items="sortOptions"
            placeholder="Urutkan"
            class="w-full sm:w-48"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-gray-400" />
            </template>
          </USelect>

          <UCheckbox
            v-model="includeDeleted"
            label="Tampilkan yang dihapus"
            class="flex items-center"
          />

          <UButton
            v-if="search || sortBy !== 'newest' || includeDeleted"
            icon="i-lucide-x"
            color="gray"
            variant="outline"
            size="sm"
            @click="clearFilters"
          >
            Reset
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Empty State -->
    <UCard v-if="schedules.length === 0 && !loading">
      <div class="text-center py-12">
        <UIcon name="i-lucide-calendar-days" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ search ? 'Jadwal Tidak Ditemukan' : 'Belum Ada Jadwal' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ search 
            ? `Tidak ditemukan jadwal yang sesuai dengan pencarian "${search}"` 
            : 'Belum ada jadwal yang dibuat. Mulai dengan menambahkan jadwal pertama.'
          }}
        </p>
        <div class="flex justify-center gap-2">
          <UButton v-if="search" @click="clearFilters" variant="outline">
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reset Pencarian
          </UButton>
          <UButton @click="() => { mode = 'add'; selectedSchedule = null; showSlideover = true }">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Jadwal
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Card Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <div
        v-for="schedule in schedules"
        :key="schedule.id"
        class="group relative"
      >
        <UCard 
          class="h-full flex flex-col hover:shadow-lg transition-shadow"
          :class="{ 'opacity-60': schedule.deleted_at }"
        >
          <!-- Header dengan Actions -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {{ schedule.name }}
                </h3>
                <UBadge 
                  :variant="schedule.deleted_at ? 'soft' : 'subtle'"
                  :color="schedule.deleted_at ? 'error' : 'success'"
                  size="sm"
                >
                  {{ schedule.deleted_at ? 'Tidak Aktif' : 'Aktif' }}
                </UBadge>
              </div>
              <p v-if="schedule.description" class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {{ schedule.description }}
              </p>
            </div>
            <UDropdownMenu
              :items="getRowItems(schedule)"
              content="align: end"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="sm"
                class="flex-shrink-0"
              />
            </UDropdownMenu>
          </div>

          <!-- Schedule Info -->
          <div class="space-y-3 mb-4 flex-1">
            <!-- Tanggal Mulai -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-calendar-check" class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm">
                <p class="text-gray-600 dark:text-gray-400">Mulai</p>
                <p class="text-gray-900 dark:text-white font-medium">
                  {{ formatDate(schedule.start_at) }}
                </p>
              </div>
            </div>

            <!-- Tanggal Selesai -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-calendar-x" class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div class="text-sm">
                <p class="text-gray-600 dark:text-gray-400">Selesai</p>
                <p class="text-gray-900 dark:text-white font-medium">
                  {{ formatDate(schedule.end_at) }}
                </p>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-200 dark:border-gray-700" />

            <!-- Classes Section -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <UIcon name="i-lucide-book" class="w-4 h-4 text-gray-400" />
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Kelas ({{ schedule.classes?.length || 0 }})
                </p>
              </div>

              <!-- Classes Grid -->
              <div v-if="schedule.classes && schedule.classes.length > 0" class="grid grid-cols-2 gap-2">
                <div
                  v-for="klass in schedule.classes.slice(0, 4)"
                  :key="klass.id"
                  class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div 
                    v-if="klass.image_url"
                    class="w-6 h-6 rounded flex-shrink-0 overflow-hidden"
                  >
                    <img 
                      :src="klass.image_url" 
                      :alt="klass.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div v-else class="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                  <p class="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {{ klass.name }}
                  </p>
                </div>
              </div>

              <!-- More Classes Badge -->
              <div v-if="schedule.classes && schedule.classes.length > 4" class="mt-2">
                <UBadge variant="soft" color="gray" size="sm">
                  +{{ schedule.classes.length - 4 }} kelas lainnya
                </UBadge>
              </div>

              <div v-else-if="!schedule.classes || schedule.classes.length === 0" class="text-xs text-gray-500 dark:text-gray-400 italic">
                Belum ada kelas yang terhubung
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-500 dark:text-gray-400">
            Dibuat {{ new Date(schedule.created_at).toLocaleDateString('id-ID') }}
          </div>
        </UCard>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="schedules.length > 0 && total > limit" class="flex justify-between items-center mb-8">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Menampilkan {{ ((page - 1) * limit) + 1 }}-{{ Math.min(page * limit, total) }} 
        dari {{ total }} jadwal
      </p>
      
      <UPagination
        v-model="page"
        :total="total"
        :page-count="limit"
        :max="7"
        show-first
        show-last
      />
    </div>

    <!-- Slideover Form -->
    <USlideover v-model:open="showSlideover" :title="mode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'">
      <template #body>
        <ScheduleForm
          :mode="mode"
          :schedule="selectedSchedule"
          @saved="handleScheduleSaved"
          @close="showSlideover = false"
        />
      </template>
    </USlideover>

    <!-- Detail Modal -->
    <UModal v-model:open="showDetailModal" class="w-full max-w-2xl">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-calendar-days" class="w-6 h-6 text-primary" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Jadwal
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Informasi lengkap jadwal pembelajaran
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <ScheduleDetail
          v-if="selectedSchedule"
          :schedule="selectedSchedule"
        />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton @click="showDetailModal = false" variant="outline">
            Tutup
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Confirm Dialog -->
    <AdminConfirmDialog
      v-if="showConfirmDialog"
      :title="confirmOptions?.title"
      :description="confirmOptions?.description"
      :variant="confirmOptions?.variant"
      confirm-text="Ya"
      cancel-text="Batal"
      @close="(confirmed) => {
        showConfirmDialog = false
        if (confirmed && confirmOptions?.action) confirmOptions.action()
      }"
    />
  </div>
</template>
