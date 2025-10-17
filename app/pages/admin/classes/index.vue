<script setup lang="ts">
import { ref, h, resolveComponent, computed, watch, onMounted } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import ClassFormContent from '~/components/Admin/Class/Form.vue'
import ClassDetailContent from '~/components/Admin/Class/Detail.vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UCheckbox = resolveComponent('UCheckbox')
const UCard = resolveComponent('UCard')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')
const UIcon = resolveComponent('UIcon')
const USlideover = resolveComponent('USlideover')
const UModal = resolveComponent('UModal')
const toast = useToast()

type Class = {
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

// State management
const data = ref<Class[]>([])
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
const selectedRow = ref<Class | null>(null)
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
  withSchedule: 0,
  withoutSchedule: 0,
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

// Delete Class
function requestDeleteClass(classItem: Class) {
  openConfirmDialog({
    title: 'Hapus Kelas',
    description: `Apakah Anda yakin ingin menghapus kelas "${classItem.name}"?`,
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/classes/${classItem.id}/delete`, { method: 'DELETE' })
        toast.add({ title: 'Kelas berhasil dihapus!', color: 'success', icon: 'i-lucide-trash' })
        fetchClasses()
      } catch (error) {
        toast.add({ title: 'Gagal menghapus kelas', color: 'error' })
      }
    }
  })
}

function requestDeletePermanentClass(classItem: Class) {
  openConfirmDialog({
    title: 'Hapus Permanen Kelas',
    description: `Apakah Anda yakin ingin menghapus permanen kelas "${classItem.name}"?`,
    variant: 'destructive',
    action: async () => {
      try {
        await $fetch(`/api/classes/${classItem.id}/delete-permanent`, { method: 'DELETE' })
        toast.add({ title: 'Kelas berhasil dihapus permanen!', color: 'success', icon: 'i-lucide-trash' })
        fetchClasses()
      } catch (error) {
        toast.add({ title: 'Gagal menghapus kelas', color: 'error' })
      }
    }
  })
}

// Restore Class
function requestRestoreClass(classItem: Class) {
  openConfirmDialog({
    title: 'Pulihkan Kelas',
    description: `Apakah Anda yakin ingin memulihkan kelas "${classItem.name}"?`,
    variant: 'default',
    action: async () => {
      try {
        await $fetch(`/api/classes/${classItem.id}/restore`, { method: 'POST' })
        toast.add({ title: 'Kelas berhasil dipulihkan!', color: 'success', icon: 'i-lucide-undo-2' })
        fetchClasses()
      } catch (error) {
        toast.add({ title: 'Gagal memulihkan kelas', color: 'error' })
      }
    }
  })
}

// Debounced search
const debouncedSearch = ref('')
let searchTimeout: NodeJS.Timeout

const debounceSearch = (value: string) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = value
  }, 500)
}

watch(search, (newValue) => {
  debounceSearch(newValue)
})

watch([debouncedSearch, includeDeleted, sortBy], () => {
  page.value = 1
  fetchClasses()
})

async function fetchClasses() {
  try {
    loading.value = true
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
      sortBy: sortBy.value,
      includeDeleted: includeDeleted.value.toString(),
    })
    
    if (debouncedSearch.value) params.append('search', debouncedSearch.value)

    const response = await $fetch(`/api/classes?${params.toString()}`)
    data.value = response.data || []
    total.value = response.pagination?.total || 0

    await fetchStats()
  } catch (error) {
    console.error('Gagal memuat kelas:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data kelas',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const response = await $fetch('/api/classes/stats')
    stats.value = {
      total: response.total || 0,
      active: response.active || 0,
      inactive: response.inactive || 0,
      withSchedule: response.withSchedule || 0,
      withoutSchedule: response.withoutSchedule || 0,
    }
  } catch (error) {
    console.error('Gagal memuat statistik:', error)
  }
}

onMounted(async () => {
  await fetchClasses()
})

watch(page, () => {
  fetchClasses()
})

const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Nama A-Z', value: 'name_asc' },
  { label: 'Nama Z-A', value: 'name_desc' }
]

// Table columns
const columns: TableColumn<Class>[] = [
  {
    accessorKey: 'name',
    header: 'Nama Kelas',
    cell: ({ row }) => {
      const classItem = row.original
      return h('div', { class: 'min-w-0' }, [
        h('div', { 
          class: 'font-medium text-gray-900 dark:text-white truncate max-w-xs',
          title: classItem.name 
        }, classItem.name)
      ])
    }
  },
  {
    accessorKey: 'schedules',
    header: 'Jadwal',
    cell: ({ row }) => {
      const schedule = row.original.schedules
      if (!schedule) {
        return h('span', { class: 'text-gray-500 dark:text-gray-400' }, '-')
      }
      return h('div', [
        h('div', { class: 'font-medium text-gray-900 dark:text-white' }, schedule.name),
        h('div', { class: 'text-sm text-gray-500 dark:text-gray-400' }, schedule.description)
      ])
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isDeleted = !!row.original.deleted_at
      return h(
        UBadge,
        {
          variant: 'subtle',
          color: isDeleted ? 'error' : 'success'
        },
        () => (isDeleted ? 'Tidak Aktif' : 'Aktif')
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            items: getRowItems(row),
            'aria-label': 'Actions dropdown',
            content: { align: 'end' }
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              'aria-label': 'Actions'
            })
        )
      )
  }
]

// Row actions
function getRowItems(row: Row<Class>) {
  const classItem = row.original

  const items = [
    { type: 'label', label: 'Actions' },
    {
      label: 'Detail',
      icon: 'i-lucide-eye',
      onSelect() {
        selectedRow.value = classItem
        showDetailModal.value = true
      }
    },
    { type: 'separator' },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        mode.value = 'edit'
        selectedRow.value = classItem
        showSlideover.value = true
      }
    }
  ]

  if (!classItem.deleted_at) {
    items.push({
      label: 'Delete',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeleteClass(classItem)
    })
  } else {
    items.push({
      label: 'Restore',
      icon: 'i-lucide-undo-2',
      onSelect: () => requestRestoreClass(classItem)
    }, {
      label: 'Delete Permanent',
      icon: 'i-lucide-trash',
      onSelect: () => requestDeletePermanentClass(classItem)
    })
  }

  return items
}

const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  sortBy.value = 'newest'
  page.value = 1
}

// Handle form save
const handleClassSaved = () => {
  showSlideover.value = false
  fetchClasses()
  toast.add({
    title: mode.value === 'add' ? 'Kelas berhasil ditambahkan!' : 'Kelas berhasil diubah!',
    color: 'success'
  })
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-book" class="w-6 h-6" />
          Kelola Kelas
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola data kelas pesantren
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }"
      >
        Tambah Kelas
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
      <!-- Total -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-book" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Kelas</p>
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

      <!-- Dengan Jadwal -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-calendar" class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Dengan Jadwal</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.withSchedule }}</p>
          </div>
        </div>
      </UCard>

      <!-- Tanpa Jadwal -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-calendar-off" class="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Tanpa Jadwal</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.withoutSchedule }}</p>
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
            placeholder="Cari nama kelas..."
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
            class="w-full sm:w-32"
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
            v-if="search || sortBy !== 'newest'"
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
    <UCard v-if="data.length === 0 && !loading">
      <div class="text-center py-12">
        <UIcon name="i-lucide-book" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ search ? 'Kelas Tidak Ditemukan' : 'Belum Ada Kelas' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ search 
            ? `Tidak ditemukan kelas yang sesuai dengan pencarian "${search}"` 
            : 'Belum ada kelas yang dibuat. Mulai dengan menambahkan kelas pertama.'
          }}
        </p>
        <div class="flex justify-center gap-2">
          <UButton v-if="search" @click="clearFilters" variant="outline">
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reset Pencarian
          </UButton>
          <UButton @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Kelas
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Data Table -->
    <UCard v-else>
      <UTable 
        :data="data" 
        :columns="columns" 
        :loading="loading"
        class="w-full"
      />

      <template #footer v-if="total > limit">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {{ ((page - 1) * limit) + 1 }}-{{ Math.min(page * limit, total) }} 
            dari {{ total }} kelas
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
      </template>
    </UCard>

    <!-- Slideover Form -->
    <USlideover v-model:open="showSlideover" :title="mode === 'add' ? 'Tambah Kelas' : 'Edit Kelas'">
      <template #body>
        <ClassFormContent
          :mode="mode"
          :class-item="selectedRow"
          @saved="handleClassSaved"
          @close="showSlideover = false"
        />
      </template>
    </USlideover>

    <!-- Detail Modal -->
    <UModal v-model:open="showDetailModal" class="w-full max-w-2xl">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-book" class="w-6 h-6 text-primary" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Kelas
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Informasi lengkap kelas
            </p>
          </div>
        </div>
      </template>

      <!-- Body -->
      <template #body>
        <ClassDetailContent
          v-if="selectedRow"
          :class-item="selectedRow"
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
        if (confirmed && confirmOptions?.action) {
          confirmOptions.action()
        }
        showConfirmDialog = false
      }"
    />
  </div>
</template>
