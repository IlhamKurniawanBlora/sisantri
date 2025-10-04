<script setup lang="ts">
import { ref, h, resolveComponent, onMounted, computed, watch } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { useClipboard } from '@vueuse/core'
import SantriFormContent from '~/components/Admin/Santri/Form.vue'
import SantriDetailContent from '~/components/Admin/Santri/Detail.vue'

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
const USlideover = resolveComponent('USlideover')
const UModal = resolveComponent('UModal')

const toast = useToast()
const { copy } = useClipboard()

type Santri = {
  id: string
  nis: string
  full_name: string
  gender: 'male' | 'female'
  birth_date?: string
  birth_place?: string
  image_url?: string | null
  address: string
  phone?: string
  parent_name?: string
  parent_phone?: string
  class_level?: string
  status?: 'active' | 'graduated' | 'dropped_out' | 'inactive'
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// State management
const data = ref<Santri[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedGender = ref('all')
const includeDeleted = ref(false)
const total = ref(0)

// Slideover states
const showSlideover = ref(false)
const mode = ref<'add' | 'edit'>('add')
const selectedRow = ref<Santri | null>(null)

// Modal states
const showDetailModal = ref(false)
const showConfirmDialog = ref(false)
const confirmOptions = ref<{
  title: string
  description: string
  variant: 'danger' | 'info'
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

watch([debouncedSearch, selectedGender, includeDeleted], () => {
  page.value = 1
  fetchSantris()
})

// Fetch data function
async function fetchSantris() {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: page.value.toString(),
      limit: limit.value.toString(),
      includeDeleted: includeDeleted.value.toString()
    })
    
    if (debouncedSearch.value) params.append('search', debouncedSearch.value)
    if (selectedGender.value && selectedGender.value !== 'all') {
      params.append('gender', selectedGender.value)
    }

    const response = await $fetch(`/api/santris?${params.toString()}`)
    data.value = response.data || []
    total.value = response.pagination?.total || 0
  } catch (error) {
    console.error('Error fetching santris:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memuat data santri',
      color: 'error'
    })
  }
  loading.value = false
}

onMounted(fetchSantris)

// Watch page changes
watch(page, () => {
  fetchSantris()
})

// Gender options
const genderOptions = [
  { label: 'Semua Gender', value: 'all' },
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

// Table columns
const columns: TableColumn<Santri>[] = [
  {
    accessorKey: 'full_name',
    header: 'Nama Lengkap',
    cell: ({ row }) => {
      const santri = row.original
      return h(UUser, {
        avatar: {
          src: santri.image_url || 'https://placehold.co/48x48?text=?'
        },
        name: santri.full_name,
        description: santri.nis
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
function getRowItems(row: Row<Santri>) {
  const santri = row.original
  
  const items = [
    { type: 'label', label: 'Actions' },
    {
      label: 'Copy NIS',
      icon: 'i-lucide-copy',
      onSelect() {
        copy(santri.nis)
        toast.add({ title: 'NIS disalin!', color: 'success', icon: 'i-lucide-check' })
      }
    },
    { type: 'separator' },
    {
      label: 'Detail',
      icon: 'i-lucide-eye',
      onSelect() {
        selectedRow.value = santri
        showDetailModal.value = true
      }
    },
    {
      label: 'Edit',
      icon: 'i-lucide-pencil',
      onSelect() {
        mode.value = 'edit'
        selectedRow.value = santri
        showSlideover.value = true
      }
    }
  ]

if (!santri.deleted_at) {
  items.push({
    label: 'Delete',
    icon: 'i-lucide-trash',
    onSelect: () => {
      confirmOptions.value = {
        title: 'Hapus Santri',
        description: `Apakah kamu yakin ingin menghapus santri ${santri.full_name}?`,
        variant: 'danger',
        action: () => deleteSantri(santri.id)
      }
      showConfirmDialog.value = true
    }
  })
} else {
  // Pilihan jika santri sudah dihapus (soft delete)
  items.push({
    label: 'Restore',
    icon: 'i-lucide-undo-2',
    onSelect: () => {
      confirmOptions.value = {
        title: 'Pulihkan Santri',
        description: `Apakah kamu yakin ingin memulihkan santri ${santri.full_name}?`,
        variant: 'info',
        action: () => restoreSantri(santri.id)
      }
      showConfirmDialog.value = true
    }
  }, {
    label: 'Hapus Permanen',
    icon: 'i-lucide-trash',
    onSelect: () => {
      confirmOptions.value = {
        title: 'Hapus Permanen Santri',
        description: `Apakah kamu yakin ingin menghapus permanen santri ${santri.full_name}? Tindakan ini tidak dapat dibatalkan.`,
        variant: 'danger', // Variasi warna yang lebih tajam untuk tindakan yang tidak dapat dibatalkan
        action: () => deletePermanentSantri(santri.id)
      }
      showConfirmDialog.value = true
    }
  })
}
  return items
}

// CRUD operations
async function deleteSantri(id: string) {
  try {
    await $fetch(`/api/santris/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Santri dihapus!', color: 'success', icon: 'i-lucide-trash' })
    fetchSantris()
  } catch (error) {
    toast.add({ title: 'Gagal menghapus santri', color: 'error' })
  }
}

async function deletePermanentSantri(id: string) {
  confirmOptions.value = {
    title: 'Hapus Permanen Santri',
    description: 'Apakah Anda yakin ingin menghapus permanen santri ini? Tindakan ini tidak dapat dibatalkan.',
    variant: 'danger',
    action: async () => {
      try {
        const response = await $fetch(`/api/santris/${id}/delete-permanent`, { method: 'DELETE' })
        
        // Cek jika berhasil
        if (response?.success) {
          toast.add({ title: 'Santri dihapus permanen!', color: 'success', icon: 'i-lucide-trash' })
          fetchSantris()  // Reload the list of santris
        } else {
          throw new Error(response?.message || 'Gagal menghapus santri permanen')
        }
      } catch (error) {
        toast.add({ title: error.message || 'Gagal menghapus permanen santri', color: 'error' })
      }
    }
  }
  showConfirmDialog.value = true
}


async function restoreSantri(id: string) {
  try {
    await $fetch(`/api/santris/${id}/restore`, { method: 'POST' })
    toast.add({ title: 'Santri dipulihkan!', color: 'success', icon: 'i-lucide-undo-2' })
    fetchSantris()
  } catch (error) {
    toast.add({ title: 'Gagal memulihkan santri', color: 'error' })
  }
}

// Stats computed
const stats = computed(() => {
  const activeSantris = data.value.filter(s => !s.deleted_at && (s.status === 'active' || !s.status))
  const maleSantris = data.value.filter(s => s.gender === 'male' && !s.deleted_at)
  const femaleSantris = data.value.filter(s => s.gender === 'female' && !s.deleted_at)
  
  return {
    total: total.value,
    active: activeSantris.length,
    male: maleSantris.length,
    female: femaleSantris.length
  }
})

// Clear filters
const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedGender.value = 'all'
  page.value = 1
}

// Handle form save
const handleSantriSaved = () => {
  showSlideover.value = false
  fetchSantris()
  toast.add({
    title: mode.value === 'add' ? 'Santri berhasil ditambahkan!' : 'Santri berhasil diperbarui!',
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
          <UIcon name="i-lucide-users" class="w-6 h-6" />
          Kelola Santri
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Kelola data santri pesantren
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        size="sm"
        @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }"
      >
        Tambah Santri
      </UButton>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-users" class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Aktif</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.active }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-user" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Laki-laki</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.male }}</p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-user" class="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Perempuan</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.female }}</p>
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
            placeholder="Cari nama, NIS, atau alamat santri..."
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

          <UCheckbox
            v-model="includeDeleted"
            label="Tampilkan yang dihapus"
            class="flex items-center"
          />

          <UButton
            v-if="search || (selectedGender && selectedGender !== 'all')"
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
        <UIcon name="i-lucide-users" class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {{ search ? 'Santri Tidak Ditemukan' : 'Belum Ada Santri' }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          {{ search 
            ? `Tidak ditemukan santri yang sesuai dengan pencarian "${search}"` 
            : 'Belum ada santri yang terdaftar. Mulai dengan menambahkan santri pertama.'
          }}
        </p>
        <div class="flex justify-center gap-2">
          <UButton v-if="search" @click="clearFilters" variant="outline">
            <UIcon name="i-lucide-refresh-cw" class="mr-2" />
            Reset Pencarian
          </UButton>
          <UButton @click="() => { mode = 'add'; selectedRow = null; showSlideover = true }">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Santri
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
            dari {{ total }} santri
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
    <USlideover v-model:open="showSlideover" :title="mode === 'add' ? 'Tambah Santri' : 'Edit Santri'">
      <template #body>
        <SantriFormContent
          :mode="mode"
          :santri="selectedRow"
          @saved="handleSantriSaved"
          @close="showSlideover = false"
        />
      </template>
    </USlideover>

    <!-- Detail Modal -->
    <UModal v-model:open="showDetailModal" class="w-full max-w-4xl">
      <template #header>
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-user" class="w-6 h-6 text-primary" />
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Detail Santri
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Informasi lengkap data santri
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <SantriDetailContent v-if="selectedRow" :santri="selectedRow" />
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UButton @click="showDetailModal = false" variant="outline">
            Tutup
          </UButton>
        </div>
      </template>
    </UModal>

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