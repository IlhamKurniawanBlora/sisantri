<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UUser = resolveComponent('UUser')
const toast = useToast()
const overlay = useOverlay()

type Santri = {
  id: string
  nis: string
  full_name: string
  gender: 'male' | 'female'
  birth_date: string
  birth_place: string
  image_url: string | null
  address: string
  phone?: string
  parent_name?: string
  parent_phone?: string
  class_level?: string
  status?: 'active' | 'graduated' | 'dropped_out' | 'inactive'
  created_at: string
  updated_at: string
  deleted_at?: string
}

const page = ref(1)
const limit = ref(10)
const search = ref('')
const selectedGender = ref('all')
const includeDeleted = ref(false)

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

const queryParams = computed(() => {
  const params: Record<string, any> = {
    page: page.value,
    limit: limit.value,
    includeDeleted: includeDeleted.value
  }
  
  if (debouncedSearch.value) params.search = debouncedSearch.value
  if (selectedGender.value && selectedGender.value !== 'all') params.gender = selectedGender.value
  
  return params
})

const { data: res, pending, error, refresh } = await useAsyncData(
  'admin-santris',
  () => {
    const params = new URLSearchParams()
    Object.entries(queryParams.value).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value.toString())
      }
    })
    return $fetch(`/api/santris?${params.toString()}`)
  },
  {
    watch: [queryParams]
  }
)

const santris = computed(() => res.value?.data ?? [])
const total = computed(() => res.value?.pagination?.total ?? 0)

watch([debouncedSearch, selectedGender, includeDeleted], () => {
  page.value = 1
})

const genderOptions = [
  { label: 'Semua Gender', value: 'all' },
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' }
]

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
        male: { label: 'Laki-laki', color: 'blue' },
        female: { label: 'Perempuan', color: 'pink' }
      }
      const info = genderMap[gender as keyof typeof genderMap]
      return h(UBadge, { variant: 'subtle', color: info?.color || 'neutral' }, () => info?.label || gender)
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const deletedAt = row.original.deleted_at
      const status = deletedAt ? 'inactive' : (row.original.status || 'active')
      const statusMap = {
        active: { label: 'Aktif', color: 'success' },
        inactive: { label: 'Tidak Aktif', color: 'neutral' }
      }
      const info = statusMap[status as keyof typeof statusMap]
      return h(UBadge, { variant: 'subtle', color: info?.color || 'neutral' }, () => info?.label || status)
    }
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => h('span', { class: 'truncate max-w-xs', title: row.original.address }, row.original.address || '-')
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat',
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return h('span', {}, date
        ? new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        : '-')
    }
  },
  {
    id: 'actions',
    cell: ({ row }) =>
      h('div', { class: 'text-right' },
        h(UDropdownMenu,
          { items: getRowItems(row) },
          () =>
            h(UButton, {
              icon: 'i-lucide-more-vertical',
              color: 'neutral',
              variant: 'ghost',
              size: 'sm'
            })
        )
      )
  }
]

function getRowItems(row: Row<Santri>) {
  const santri = row.original
  
  const items = [
    [{
      label: 'Detail',
      icon: 'i-lucide-eye',
      click: () => viewSantri(santri)
    }],
    [{
      label: 'Edit',
      icon: 'i-lucide-edit',
      click: () => editSantri(santri)
    }]
  ]

  if (!santri.deleted_at) {
    items.push([{
      label: 'Hapus',
      icon: 'i-lucide-trash-2',
      click: () => deleteSantri(santri.id)
    }])
  } else {
    items.push([{
      label: 'Pulihkan',
      icon: 'i-lucide-undo-2',
      click: () => restoreSantri(santri.id)
    }])
  }
  
  return items
}

// Create overlay instances
import AdminSantriForm from '~/components/Admin/Santri/Form.vue'
import AdminSantriDetail from '~/components/Admin/Santri/Detail.vue'
import ConfirmDialog from '~/components/Admin/ConfirmDialog.vue'
const santriFormSlideover = overlay.create(AdminSantriForm)
const santriDetailModal = overlay.create('AdminSantriDetail')
const confirmDialog = overlay.create('ConfirmDialog')

const addSantri = () => {
  santriFormSlideover.open({
    title: 'Tambah Santri Baru',
    icon: 'i-lucide-plus-circle',
    onSaved: (isEdit = false) => handleSantriSaved(isEdit),
    onCancel: () => santriFormSlideover.close()
  })
}

const viewSantri = (santri: Santri) => {
  santriDetailModal.open({
    title: 'Detail Santri',
    icon: 'i-lucide-user',
    santri,
    onClose: () => santriDetailModal.close()
  })
}

const editSantri = (santri: Santri) => {
  santriFormSlideover.open({
    title: 'Edit Santri',
    icon: 'i-lucide-edit',
    santri,
    onSaved: (isEdit = true) => handleSantriSaved(isEdit),
    onCancel: () => santriFormSlideover.close()
  })
}

const deleteSantri = async (id: string) => {
  const confirmInstance = confirmDialog.open({
    title: 'Hapus Santri',
    description: 'Apakah Anda yakin ingin menghapus santri ini?',
    confirmText: 'Hapus',
    cancelText: 'Batal',
    variant: 'destructive'
  })

  const isConfirmed = await confirmInstance
  if (!isConfirmed) return
  
  try {
    await $fetch(`/api/santris/${id}`, { method: 'DELETE' })
    toast.add({
      title: 'Santri berhasil dihapus!',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal menghapus santri',
      color: 'error'
    })
  }
}

const restoreSantri = async (id: string) => {
  const confirmInstance = confirmDialog.open({
    title: 'Pulihkan Santri',
    description: 'Apakah Anda yakin ingin memulihkan santri ini?',
    confirmText: 'Pulihkan',
    cancelText: 'Batal'
  })

  const isConfirmed = await confirmInstance
  if (!isConfirmed) return
  
  try {
    await $fetch(`/api/santris/${id}/restore`, { method: 'POST' })
    toast.add({
      title: 'Santri berhasil dipulihkan!',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Gagal memulihkan santri',
      color: 'error'
    })
  }
}

const handleSantriSaved = (isEdit = false) => {
  santriFormSlideover.close()
  refresh()
  toast.add({
    title: isEdit ? 'Santri berhasil diperbarui!' : 'Santri berhasil ditambahkan!',
    color: 'success'
  })
}

const clearFilters = () => {
  search.value = ''
  debouncedSearch.value = ''
  selectedGender.value = 'all'
  page.value = 1
}

const stats = computed(() => {
  const activeSantris = santris.value.filter(s => !s.deleted_at && (s.status === 'active' || !s.status))
  const maleSantris = santris.value.filter(s => s.gender === 'male' && !s.deleted_at)
  const femaleSantris = santris.value.filter(s => s.gender === 'female' && !s.deleted_at)
  
  return {
    total: total.value,
    active: activeSantris.length,
    male: maleSantris.length,
    female: femaleSantris.length
  }
})
</script>

<template>
  <div>
    <div class="mb-8">
      <div class="flex items-center justify-between">
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
          @click="addSantri"
        >
          Tambah Santri
        </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <UCard>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <UIcon name="i-lucide-users" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Santri</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
      </UCard>

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

    <UCard class="mb-6">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Cari nama, NIS, atau alamat santri..."
            :trailing="search ? true : false"
            :loading="pending"
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

    <UCard v-if="pending">
      <div class="space-y-4">
        <div v-for="i in 5" :key="i" class="animate-pulse">
          <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </UCard>

    <UCard v-else-if="error">
      <div class="text-center py-12">
        <UIcon name="i-lucide-alert-triangle" class="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Terjadi Kesalahan
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          Gagal memuat data santri. Silakan coba lagi.
        </p>
        <UButton @click="refresh" variant="outline">
          <UIcon name="i-lucide-refresh-cw" class="mr-2" />
          Coba Lagi
        </UButton>
      </div>
    </UCard>

    <UCard v-else-if="santris.length === 0">
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
          <UButton @click="addSantri">
            <UIcon name="i-lucide-plus" class="mr-2" />
            Tambah Santri
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard v-else>
      <UTable 
        :data="santris" 
        :columns="columns" 
        :loading="pending"
        class="w-full"
      />

      <template #footer>
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
  </div>
</template>