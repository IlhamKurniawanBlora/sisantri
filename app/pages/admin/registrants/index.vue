<script setup lang="ts">
import { ref, h, resolveComponent, onMounted, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
import RegistrantDetailContent from '~/components/Admin/Registrant/Detail.vue'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UUser = resolveComponent('UUser')
const UInput = resolveComponent('UInput')
const USelect = resolveComponent('USelect')
const UCheckbox = resolveComponent('UCheckbox')
const UCard = resolveComponent('UCard')
const UTable = resolveComponent('UTable')
const UPagination = resolveComponent('UPagination')
const UIcon = resolveComponent('UIcon')
const UModal = resolveComponent('UModal')

const toast = useToast()
const { copy } = useClipboard()

type Registrant = {
  id: string
  nis: string
  full_name: string
  gender: 'male' | 'female'
  birth_place_date?: string
  image_url?: string | null
  address: string
  phone_number?: string
  nik?: string
  no_kk?: string
  nisn?: string
  no_kip?: string
  no_pkh?: string
  no_kks?: string
  rt_rw?: string
  kecamatan?: string
  kabupaten?: string
  provinsi?: string
  kode_pos?: string
  pendidikan_sd?: string
  pendidikan_smp?: string
  pendidikan_sma?: string
  pendidikan_non_formal?: string
  hafal_quran?: string
  created_at: string
  updated_at: string
  accepted_at?: string | null
}

// State management
const data = ref<Registrant[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedGender = ref('all')
const sortBy = ref('newest')
const total = ref(0)

// Modal states
const showDetailModal = ref(false)
const selectedRow = ref<Registrant | null>(null)

// Confirm dialog state
const showConfirmDialog = ref(false)
const confirmOptions = ref<{
  title: string
  description: string
  variant: 'destructive' | 'default'
  action?: () => void
} | null>(null)

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

watch([debouncedSearch, selectedGender, sortBy], () => {
  page.value = 1
  fetchRegistrants()
})

// Fetch data function
async function fetchRegistrants() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString()
    })
    
    if (debouncedSearch.value) params.append('search', debouncedSearch.value)
    if (selectedGender.value && selectedGender.value !== 'all') {
      params.append('gender', selectedGender.value)
    }
    if (sortBy.value) params.append('sortBy', sortBy.value)

    const response = await $fetch(`/api/registrants?${params.toString()}`)
    data.value = response.data || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Error fetching registrants:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data pendaftar',
      color: 'error'
    })
  }
  loading.value = false
}

onMounted(() => {
  fetchRegistrants()
})

// Watch page changes
watch(page, () => {
  fetchRegistrants()
})

// Gender options
const genderOptions = [
  { label: 'Semua Gender', value: 'all' },
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

// Sort options
const sortOptions = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Nama A-Z', value: 'name_asc' },
  { label: 'Nama Z-A', value: 'name_desc' }
]

// Table columns
const columns: TableColumn<Registrant>[] = [
  {
    accessorKey: 'full_name',
    header: 'Nama Lengkap',
    cell: ({ row }) => {
      const registrant = row.original
      return h(UUser, {
        avatar: {
          src: registrant.image_url || 'https://placehold.co/48x48?text=?'
        },
        name: registrant.full_name,
        description: registrant.nis
      })
    }
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => {
      const gender = row.getValue('gender') as string
      const genderMap = {
        male: { label: 'Laki-laki', color: 'primary' },
        female: { label: 'Perempuan', color: 'neutral' }
      }
      const info = genderMap[gender as keyof typeof genderMap]
      return h(UBadge, { variant: 'subtle', color: info?.color || 'neutral' }, () => info?.label || gender)
    }
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => h('span', { class: 'truncate max-w-xs', title: row.original.address }, row.original.address || '-')
  },
  {
    accessorKey: 'phone_number',
    header: 'No. Telepon',
    cell: ({ row }) => h('span', {}, row.original.phone_number || '-')
  },
  {
    accessorKey: 'created_at',
    header: 'Mendaftar',
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
    header: 'Aksi',
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
function getRowItems(row: Row<Registrant>) {
  const registrant = row.original
  
  return [
    { type: 'label', label: 'Actions' },
    {
      label: 'Copy NIS',
      icon: 'i-lucide-copy',
      onSelect() {
        copy(registrant.nis)
        toast.add({ title: 'NIS disalin!', color: 'success', icon: 'i-lucide-check' })
      }
    },
    { type: 'separator' },
    {
      label: 'Lihat Detail',
      icon: 'i-lucide-eye',
      onSelect() {
        selectedRow.value = registrant
        showDetailModal.value = true
      }
    },
    {
      label: 'Terima Pendaftar',
      icon: 'i-lucide-check-circle',
      onSelect() {
        confirmOptions.value = {
          title: 'Terima Pendaftar',
          description: `Apakah Anda yakin ingin menerima pendaftar ${registrant.full_name}?`,
          variant: 'default',
          action: () => acceptRegistrant(registrant.id)
        }
        showConfirmDialog.value = true
      }
    }
  ]
}

// CRUD operations
async function acceptRegistrant(id: string) {
  try {
    await $fetch(`/api/registrants/${id}/accept`, { method: 'PATCH' })
    toast.add({ title: 'Pendaftar diterima!', color: 'success', icon: 'i-lucide-check-circle' })
    fetchRegistrants()
  } catch (error) {
    toast.add({ title: 'Gagal menerima pendaftar', color: 'error' })
  }
}

// Clear filters
const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedGender.value = 'all'
  sortBy.value = 'newest'
  page.value = 1
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-lucide-inbox" class="w-6 h-6" />
          Kelola Pendaftar
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola pendaftar santri baru pesantren
        </p>
      </div>
    </div>

    <!-- Stats Card -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Total Pendaftar -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-inbox" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pendaftar</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ total }}</p>
          </div>
        </div>
      </UCard>

      <!-- Menunggu Persetujuan -->
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-clock" class="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Menunggu Persetujuan</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ total }}</p>
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
            placeholder="Cari nama, NIS, atau alamat pendaftar..."
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
            v-model="selectedGender"
            :items="genderOptions"
            placeholder="Filter Gender"
            class="w-full sm:w-40"
          >
            <template #leading>
              <UIcon name="i-lucide-users" class="w-4 h-4 text-gray-400" />
            </template>
          </USelect>

          <USelect
            v-model="sortBy"
            :items="sortOptions"
            placeholder="Urutkan"
            class="w-full sm:w-40"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4 text-gray-400" />
            </template>
          </USelect>

          <UButton
            v-if="search || (selectedGender && selectedGender !== 'all') || (sortBy && sortBy !== 'newest')"
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
        <UIcon name="i-lucide-inbox" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ search ? 'Pendaftar Tidak Ditemukan' : 'Belum Ada Pendaftar' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ search 
            ? `Tidak ditemukan pendaftar yang sesuai dengan pencarian "${search}"` 
            : 'Belum ada pendaftar baru. Menunggu santri baru untuk mendaftar.'
          }}
        </p>
        <div v-if="search" class="flex justify-center gap-2">
          <UButton @click="clearFilters" variant="outline">
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reset Pencarian
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
            dari {{ total }} pendaftar
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

    <!-- Detail Modal -->
    <UModal v-model:open="showDetailModal" class="w-full max-w-4xl">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-inbox" class="w-6 h-6 text-primary" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Pendaftar
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Informasi lengkap data pendaftar
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <RegistrantDetailContent v-if="selectedRow" :registrant="selectedRow" />
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton @click="showDetailModal = false" variant="outline">
            Tutup
          </UButton>
          <UButton
            @click="() => {
              confirmOptions = {
                title: 'Terima Pendaftar',
                description: `Apakah Anda yakin ingin menerima pendaftar ${selectedRow?.full_name}?`,
                variant: 'default',
                action: () => {
                  acceptRegistrant(selectedRow!.id)
                  showDetailModal = false
                }
              }
              showConfirmDialog = true
            }"
            icon="i-lucide-check-circle"
            color="green"
          >
            Terima Pendaftar
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
